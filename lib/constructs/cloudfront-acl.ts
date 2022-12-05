import { CfnIPSet, CfnWebACL } from 'aws-cdk-lib/aws-wafv2'
import { Construct } from 'constructs'

export type CloudFrontAclProps = {
  requiresVpn: boolean
}

/**
 * Create an ACL for CloudFront that:
 * - whitelists VPN IP addresses
 * - whitelists the UI testing ec2 instance elastic IP address
 * - has the option of blocking or allowing access by default
 * - blocks regular attacks like bots etc
 */
export class CloudFrontAcl extends Construct {
  public readonly acl: CfnWebACL

  constructor(scope: Construct, id: string, props: CloudFrontAclProps) {
    super(scope, id)

    // Value from dev
    const UI_AUTOMATION_ELASTIC_IP = '3.96.71.4/32'

    const cfnIPSet = new CfnIPSet(this, 'VpnIpSet', {
      addresses: [
        '184.147.166.107/32',
        '52.8.1.239/32',
        '69.17.174.61/32',
        '24.137.222.4/30',
        '64.229.230.106/32',
        '148.170.159.44/32',
        '99.250.171.235/32',
        '38.23.181.38/32',
        '74.114.74.1/32',
        '72.138.13.176/30',
        '69.17.174.56/29',
        '92.98.5.175/32',
        '99.246.29.199/32',
        '64.46.1.154/32',
        UI_AUTOMATION_ELASTIC_IP,
      ],
      ipAddressVersion: 'IPV4',
      scope: 'CLOUDFRONT',
      description: 'VPN IP addresses',
    })

    const ipReputationRuleSet: CfnWebACL.ManagedRuleGroupStatementProperty = {
      name: 'AWSManagedRulesAmazonIpReputationList',
      vendorName: 'AWS',
    }
    const commonRuleSet: CfnWebACL.ManagedRuleGroupStatementProperty = {
      name: 'AWSManagedRulesCommonRuleSet',
      vendorName: 'AWS',
      excludedRules: [
        { name: 'SizeRestrictions_BODY' }, // caps 8KB body
        { name: 'CrossSiteScripting_BODY' }, // Settings page blocks inline HTML styles otherwise
      ],
    }
    const wpRuleSet: CfnWebACL.ManagedRuleGroupStatementProperty = {
      name: 'AWSManagedRulesWordPressRuleSet',
      vendorName: 'AWS',
    }
    const botControlRuleSet: CfnWebACL.ManagedRuleGroupStatementProperty = {
      name: 'AWSManagedRulesBotControlRuleSet',
      vendorName: 'AWS',
    }

    const denyResponseBodyKey = 'deny'

    /**
     * On dev we want to deny by default and whitelist VPN ips
     * On other environments, we want to allow by default.
     */

    const allowAction: CfnWebACL.DefaultActionProperty = {
      allow: {
        customRequestHandling: {
          insertHeaders: [
            {
              name: 'x-acl-success',
              value: 'true',
            },
          ],
        },
      },
    }

    const denyAction: CfnWebACL.DefaultActionProperty = {
      block: {
        customResponse: {
          responseCode: 403,
          customResponseBodyKey: denyResponseBodyKey,
        },
      },
    }

    const rules: Array<CfnWebACL.RuleProperty> = [
      {
        name: 'botControlRuleSet',
        priority: 1,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'School-botControlRuleSet',
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: botControlRuleSet,
        },
        overrideAction: {
          none: {},
        },
      },
      {
        name: 'wpRuleSet',
        priority: 2,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'School-wpRuleSet',
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: wpRuleSet,
        },
        overrideAction: {
          none: {},
        },
      },
      {
        name: 'commonRuleSet',
        priority: 3,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'School-commonRuleSet',
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: commonRuleSet,
        },
        overrideAction: {
          none: {},
        },
      },
      {
        name: 'ipReputationRuleSet',
        priority: 4,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'School-ipReputationRuleSet',
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: ipReputationRuleSet,
        },
        overrideAction: {
          none: {},
        },
      },
    ]

    const rulesWithVpn = [
      ...rules,
      {
        name: 'vpnIpSet',
        priority: 5,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'School-vpnIpSet',
          sampledRequestsEnabled: true,
        },
        statement: {
          ipSetReferenceStatement: {
            arn: cfnIPSet.attrArn,
          },
        },
        action: {
          allow: {
            customRequestHandling: {
              insertHeaders: [
                {
                  name: 'x-acl-success',
                  value: 'true',
                },
              ],
            },
          },
        },
      },
    ]

    this.acl = new CfnWebACL(this, 'Acl', {
      /**
       * The defaultAction is required. The only option is to add a header and its required.
       */
      customResponseBodies: {
        [denyResponseBodyKey]: {
          content: 'No authorization to access this site.',
          contentType: 'TEXT_PLAIN',
        },
      },
      defaultAction: props.requiresVpn ? denyAction : allowAction,
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'School',
        sampledRequestsEnabled: true,
      },
      rules: props.requiresVpn ? rulesWithVpn : rules,
    })
  }
}
