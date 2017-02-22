# Discovery Queue Manager

Listens to a queue of documents from a stream, batches them, and sends them down-stream.

## Dev setup

1. Install grunt and node modules

   ```
   npm install grunt -g
   npm install
   ```

2. Install Amazon CLI

  ```
  pip install awscli
  ```

3. Set up AWS

  ```
  aws configure
  AWS Access Key ID [None]: ...
  AWS Secret Access Key [None]: ...
  Default region name [None]: us-east-1
  Default output format [None]: json
  ```

4. Create/describe Kinesis stream

  ```
  grunt init
  ```
