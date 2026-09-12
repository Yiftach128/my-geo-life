# CloudFormation

Infrastructure for my-geo-life as plain CloudFormation YAML, one template per lifecycle.
Nothing in this folder contains account IDs, ARNs or IP addresses: templates use the
`AWS::AccountId` and `AWS::Region` pseudo parameters, and anything account-specific is
passed as a parameter at deploy time.

| Template | Stack name | Lifecycle | Bills while it exists |
|---|---|---|---|
| `foundation.yaml` | `my-geo-life-foundation` | permanent | nothing |
| `network.yaml` | `my-geo-life-network` | permanent | nothing |
| `app.yaml` | `my-geo-life-app` | up for a demo, deleted after | ALB and Fargate task by the hour |
| `cost-guard.yaml` | `my-geo-life-cost-guard` | permanent | nothing |

The app stack imports role ARNs, subnet IDs and security group IDs that the foundation and
network stacks export, so those two must exist first and cannot be deleted while the app
stack is up.

## Prerequisites

- AWS CLI v2 configured with credentials that may create the resources, default region `eu-central-1`.
- The two secrets already in SSM Parameter Store as SecureString: `/my-geo-life/MONGO_URI`
  and `/my-geo-life/JWT_SECRET`. They are created once outside CloudFormation, so that
  secret values never appear in a template.

## foundation.yaml

ECR repository `my-geo-life` (scan on push, keeps the newest 10 images), log group
`/ecs/my-geo-life` (14 days), the ECS task execution role and task role, and the
CloudFormation service role used for every operation on the app stack. Creates named IAM
roles, so the deploy needs `CAPABILITY_NAMED_IAM`. Deploy once:

```sh
aws cloudformation deploy \
  --stack-name my-geo-life-foundation \
  --template-file cloudformation/foundation.yaml \
  --capabilities CAPABILITY_NAMED_IAM
aws cloudformation list-exports --query "Exports[].[Name,Value]" --output table
```

Then push the application image into the new repository. The registry host is the
part of the repository URI before the first slash:

```sh
REPO=$(aws cloudformation list-exports \
  --query "Exports[?Name=='my-geo-life-foundation-ecr-uri'].Value" --output text)
aws ecr get-login-password | docker login --username AWS --password-stdin "${REPO%%/*}"
docker build -t my-geo-life:v1 .
docker tag my-geo-life:v1 "$REPO:v1"
docker push "$REPO:v1"
```

Running `deploy` again with no template change reports "No changes to deploy". Deleting
this stack is refused while the app stack imports its exports; with the app stack gone,
`delete-stack` removes everything including the images in the repository.

## network.yaml

VPC `10.0.0.0/16` with two public subnets in two availability zones, an internet gateway,
a route table that sends everything outside the VPC to that gateway, and two security
groups: `my-geo-life-alb-sg` (port 80 from anywhere) and `my-geo-life-task-sg` (the
container port, only from the load balancer group). No NAT gateway: the tasks run in the
public subnets with a public IP, which is free. Creates no IAM resources, so no
capability flag. Deploy once:

```sh
aws cloudformation deploy \
  --stack-name my-geo-life-network \
  --template-file cloudformation/network.yaml
```

Zone names come from `Fn::GetAZs`, so the same template works in any region. The two
subnet ids are exported as one comma-separated string, because an export must be a
string; the app stack splits it. Like the foundation stack, this one cannot be deleted
while the app stack imports its exports.

## app.yaml

ECS cluster `my-geo-life`, a Fargate task definition for an image in the foundation
repository, a service that keeps `DesiredCount` tasks running in the network stack's
public subnets under `my-geo-life-task-sg`, and an internet-facing application load
balancer in front of them with an HTTP listener on port 80 and a target group that
health-checks `/health`. The two secrets are injected from Parameter Store by the task
execution role; the template holds only their ARNs, built from pseudo parameters. This
is the only stack that bills while it exists, so it is created for a demo and deleted
after.

Every operation on this stack passes `--role-arn`, the CloudFormation service role
exported by the foundation stack. CloudFormation keeps that role on the stack and uses
it for later updates and deletes as well. `ImageTag` has no default: the first deploy
must state it, later deploys reuse the previous value unless overridden.

```sh
ROLE=$(aws cloudformation list-exports \
  --query "Exports[?Name=='my-geo-life-foundation-cfn-app-role-arn'].Value" --output text)
aws cloudformation deploy \
  --stack-name my-geo-life-app \
  --template-file cloudformation/app.yaml \
  --parameter-overrides ImageTag=v1 \
  --role-arn "$ROLE"
```

The deploy returns when the service is stable. If a task cannot start (a wrong tag, a
missing parameter), the deployment circuit breaker marks the deployment failed and the
stack rolls back within a few minutes instead of waiting for a timeout. A failed first
create leaves the stack in `ROLLBACK_COMPLETE`; delete it before trying again.

The `Url` output is the load balancer address. The app answers there once the target
group reports the task healthy, usually within a minute of the stack completing:

```sh
URL=$(aws cloudformation describe-stacks --stack-name my-geo-life-app \
  --query "Stacks[0].Outputs[?OutputKey=='Url'].OutputValue" --output text)
curl -s "$URL/health"
aws ecs describe-services --cluster my-geo-life --services my-geo-life \
  --query "services[0].[status,runningCount,desiredCount,deployments[0].rolloutState]" \
  --output text
aws logs tail /ecs/my-geo-life --since 10m
```

Later deploys are rolling updates: `--parameter-overrides ImageTag=v2` registers a new
task definition revision and the service replaces its tasks one at a time behind the
load balancer, so the address never changes. To see what a deploy would do before it
runs, create the change set without executing it, read it, then execute:

```sh
aws cloudformation deploy --stack-name my-geo-life-app \
  --template-file cloudformation/app.yaml --role-arn "$ROLE" --no-execute-changeset
CS=$(aws cloudformation list-change-sets --stack-name my-geo-life-app \
  --query "Summaries[0].ChangeSetName" --output text)
aws cloudformation describe-change-set --stack-name my-geo-life-app --change-set-name "$CS" \
  --query "Changes[].ResourceChange.[Action,LogicalResourceId,Replacement]" --output table
aws cloudformation execute-change-set --stack-name my-geo-life-app --change-set-name "$CS"
aws cloudformation wait stack-update-complete --stack-name my-geo-life-app
```

`Replacement: True` on a resource means CloudFormation will create a new one and delete
the old one, which for a service or load balancer means downtime and a new address.

Delete when the demo is over:

```sh
aws cloudformation delete-stack --stack-name my-geo-life-app
aws cloudformation wait stack-delete-complete --stack-name my-geo-life-app
```
