



# IMAGE_TAG=$(git rev-parse --short --verify HEAD)
IMAGE_TAG=latest
AWS_REGION="ap-southeast-1"
ECR_REPOSITORY="document-base"
ECS_SERVICE="document-base-stg"
ECS_CLUSTER="document-base"
AWS_ACCOUNT_ID="930488782669"
CONTAINER_NAME="document-base-stg"

# Docker Build
echo "Docker Build"
docker build --platform=linux/amd64 -t document-base .

# Docker Tag
echo "Docker Tag"
docker tag document-base:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

# Aws Login
echo "AWS Login"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Docker Push
echo "Docker Push"
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

# Aws Deploy
echo "AWS Deploy"
# aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force-new-deployment --region=${AWS_REGION}
