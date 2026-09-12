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
