/// <reference path="./.sst/platform/config.d.ts" />

export default {
  config() {
    return {
      name: 'aiready-platform',
      region: 'ap-southeast-2',
      profile: 'aiready',
    };
  },
  stacks(app) {
    app.stack(function PlatformStack({ stack }) {
      // DynamoDB Single Table
      const table = new sst.aws.Dynamo('MainTable', {
        fields: {
          PK: 'string',
          SK: 'string',
          GSI1PK: 'string',
          GSI1SK: 'string',
          GSI2PK: 'string',
          GSI2SK: 'string',
        },
        primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
        globalIndexes: {
          GSI1: { partitionKey: 'GSI1PK', sortKey: 'GSI1SK' },
          GSI2: { partitionKey: 'GSI2PK', sortKey: 'GSI2SK' },
        },
        ttl: 'ttl',
      });

      // S3 Bucket for analysis data
      const bucket = new sst.aws.Bucket('AnalysisBucket', {
        access: 'private',
      });

      // Next.js site
      const site = new sst.aws.Nextjs('Dashboard', {
        path: '.',
        environment: {
          DYNAMO_TABLE: table.name,
          S3_BUCKET: bucket.name,
        },
      });

      // Grant permissions
      table.bind([site]);
      bucket.bind([site]);

      stack.addOutputs({
        SiteUrl: site.url,
        TableName: table.name,
        BucketName: bucket.name,
      });
    });
  },
};