# table for generating poster id
aws dynamodb create-table --table-name counts \
  --attribute-definitions AttributeName=name,AttributeType=S \
  --key-schema AttributeName=name,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --query TableDescription.TableArn --output text

# table for poster data
aws dynamodb create-table --table-name posters \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --query TableDescription.TableArn --output text