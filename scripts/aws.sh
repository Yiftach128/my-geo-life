#!/usr/bin/env bash
# Puts my-geo-life on AWS, or takes it down again.
#
#   scripts/aws.sh up <tag>    build the image, push it to ECR as <tag>, create or update the app stack
#   scripts/aws.sh down        delete the app stack and wait until it is gone
#   scripts/aws.sh status      what is still there, and therefore still billing
#
# The foundation and network stacks are permanent and free. They are deployed once, as
# described in cloudformation/README.md, and this script only reads what they export. The
# app stack is the one that bills, so it goes up for a demo and comes down afterwards.
# Everything account-specific (registry, service role) is resolved at run time from the
# exports; there is nothing to edit here. Needs docker, curl and the AWS CLI configured
# with a default profile and region.
set -euo pipefail
cd "$(dirname "$0")/.."   # repository root: the Docker build context and the template path are relative to it

PREFIX=my-geo-life
APP_STACK=$PREFIX-app
FOUNDATION_STACK=$PREFIX-foundation

usage() {
  echo "usage: scripts/aws.sh up <tag> | down | status"
}

export_value() {   # export_value <name>: the value the foundation stack exports under that name
  local value
  value=$(aws cloudformation list-exports --query "Exports[?Name=='$1'].Value" --output text)
  [ -n "$value" ] || {
    echo "aws.sh: export $1 not found; deploy the foundation and network stacks first (cloudformation/README.md)" >&2
    exit 1
  }
  echo "$value"
}

up() {
  local tag=$1 repo registry role url
  repo=$(export_value "$FOUNDATION_STACK-ecr-uri")
  role=$(export_value "$FOUNDATION_STACK-cfn-app-role-arn")
  registry=${repo%%/*}   # the registry host is the part of the repository URI before the first slash

  echo "==> building $PREFIX:$tag"
  docker build --tag "$PREFIX:$tag" .

  echo "==> pushing $repo:$tag"
  # get-login-password returns a token valid for 12 hours; logging in every time costs one call.
  aws ecr get-login-password | docker login --username AWS --password-stdin "$registry"
  docker tag "$PREFIX:$tag" "$repo:$tag"
  docker push "$repo:$tag"

  echo "==> deploying $APP_STACK with ImageTag=$tag"
  # Creates the stack or updates it, and returns when the service is stable. Every
  # operation on the stack runs under the service role, so the caller needs only
  # CloudFormation permissions plus iam:PassRole on that role. Use a new tag for every
  # build: the task definition names the tag, so an image rebuilt under an old tag is
  # pushed but never rolled out, and the deploy reports nothing to do.
  aws cloudformation deploy \
    --stack-name "$APP_STACK" \
    --template-file cloudformation/app.yaml \
    --parameter-overrides "ImageTag=$tag" \
    --role-arn "$role" \
    --no-fail-on-empty-changeset

  url=$(aws cloudformation describe-stacks --stack-name "$APP_STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='Url'].OutputValue" --output text)
  echo "==> waiting for $url/health"
  # The load balancer answers 503 until the target group reports the task healthy,
  # usually under a minute after the stack completes.
  curl -fsS --retry 10 --retry-delay 6 --retry-all-errors "$url/health" || {
    echo "aws.sh: the stack is up but $url/health does not answer; cloudformation/README.md shows how to inspect the service" >&2
    exit 1
  }
  echo
  echo "up: $url"
}

down() {
  echo "==> deleting $APP_STACK"
  # No --role-arn: CloudFormation keeps the service role given at creation and deletes with
  # it. Both commands succeed when the stack does not exist, so down is safe to repeat.
  aws cloudformation delete-stack --stack-name "$APP_STACK"
  aws cloudformation wait stack-delete-complete --stack-name "$APP_STACK"
  status
}

row() {   # row <label> <values>: one line of the status report, "none" when there is nothing
  local values=${2//[$'\t\n']/, }
  printf '%-16s %s\n' "$1" "${values:-none}"
}

status() {
  # Stacks come from CloudFormation; clusters and load balancers are asked for directly,
  # so a deletion that failed halfway still shows up. Region: the CLI default.
  local stacks clusters balancers
  stacks=$(aws cloudformation list-stacks --output text --query \
    "StackSummaries[?StackStatus!='DELETE_COMPLETE' && starts_with(StackName, '$PREFIX')].join(' ', [StackName, StackStatus])")
  clusters=$(aws ecs list-clusters --query "clusterArns[]" --output text | sed 's|[^[:space:]]*/||g')   # ARN to name
  balancers=$(aws elbv2 describe-load-balancers --query "LoadBalancers[].DNSName" --output text)
  row "stacks:"         "$stacks"
  row "ECS clusters:"   "$clusters"
  row "load balancers:" "$balancers"
}

case ${1:-} in
  up)     [ $# -eq 2 ] || { usage >&2; exit 1; }; up "$2" ;;
  down)   down ;;
  status) status ;;
  *)      usage >&2; exit 1 ;;
esac
