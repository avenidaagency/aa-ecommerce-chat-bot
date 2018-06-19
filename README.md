# techninjas



### AWS Elastic Beanstalk CLI Setup


##### Mac and Linux

Requires Python 2.6.5 or higher.
Install using pip.

`pip install awscli`

`pip install awsebcli --upgrade --user`



The AWS CLI will prompt you for four pieces of information. AWS Access Key ID and AWS Secret Access Key are your account credentials.

`$ aws configure`

`AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE`

`AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

`Default region name [None]: us-east-1`

`Default output format [None]: json`




### Deployment

The application and environment are already created in AWS, to deploy a new version  of the application just run:

`
eb deploy
`
