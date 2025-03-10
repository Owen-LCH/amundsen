import AppConfig from 'config/config';
import * as ConfigUtils from 'config/config-utils';
import { BadgeStyle, NoticeSeverity } from 'config/config-types';

import { ResourceType } from 'interfaces';

describe('getSourceDisplayName', () => {
  it('returns given id if no config for that id exists', () => {
    const testId = 'fakeName';
    expect(ConfigUtils.getSourceDisplayName(testId, ResourceType.table)).toBe(
      testId
    );
  });

  it('returns given id for a configured source id', () => {
    const testId = 'hive';
    const expectedName = (<any>AppConfig).resourceConfig[ResourceType.table]
      .supportedSources[testId].displayName;
    expect(expectedName).toBeDefined();
    expect(ConfigUtils.getSourceDisplayName(testId, ResourceType.table)).toBe(
      expectedName
    );
  });
});

describe('getSourceIconClass', () => {
  describe('if not config for the given id exists', () => {
    it('returns default class for dashboard', () => {
      const testId = 'fakeName';
      expect(
        ConfigUtils.getSourceIconClass(testId, ResourceType.dashboard)
      ).toBe(ConfigUtils.DEFAULT_DASHBOARD_ICON_CLASS);
    });

    it('returns default class for tables', () => {
      const testId = 'fakeName';
      expect(ConfigUtils.getSourceIconClass(testId, ResourceType.table)).toBe(
        ConfigUtils.DEFAULT_DATABASE_ICON_CLASS
      );
    });
  });

  it('returns empty string for unconfigured resource', () => {
    expect(ConfigUtils.getSourceIconClass('fakeName', ResourceType.user)).toBe(
      ''
    );
  });

  it('returns given icon class for a configured database id', () => {
    const testId = 'hive';
    const expectedClass = (<any>AppConfig).resourceConfig[ResourceType.table]
      .supportedSources[testId].iconClass;
    expect(expectedClass).toBeDefined();
    expect(ConfigUtils.getSourceIconClass(testId, ResourceType.table)).toBe(
      expectedClass
    );
  });
});

describe('getDisplayNameByResource', () => {
  it('returns the displayName for a given resource', () => {
    const testResource = ResourceType.table;
    const expectedValue = AppConfig.resourceConfig[testResource].displayName;
    expect(ConfigUtils.getDisplayNameByResource(testResource)).toBe(
      expectedValue
    );
  });
});

describe('getResourceNotices', () => {
  describe('when there is no notice', () => {
    it('returns false', () => {
      const resources = [ResourceType.table, ResourceType.dashboard];
      resources.forEach((resource) => {
        AppConfig.resourceConfig[resource].notices = {
          testName: {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
        };
        const expected = false;
        const actual = ConfigUtils.getResourceNotices(
          resource,
          'testNameNoThere'
        );

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('when there is a notice', () => {
    it('returns the notice', () => {
      const resources = [ResourceType.table, ResourceType.dashboard];
      resources.forEach((resource) => {
        AppConfig.resourceConfig[resource].notices = {
          testName: {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
        };
        const expected = 'testMessage';
        const notice = ConfigUtils.getResourceNotices(resource, 'testName');
        const actual = notice && notice.messageHtml;

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('when there is a notice with a dynamic message', () => {
    it('returns notice with dynamic message', () => {
      const resources = [ResourceType.table, ResourceType.dashboard];
      resources.forEach((resource) => {
        AppConfig.resourceConfig[resource].notices = {
          'cluster1.datasource1.schema1.table1': {
            severity: NoticeSeverity.WARNING,
            messageHtml: (resourceName) => {
              const [cluster, datasource, schema, table] = resourceName.split(
                '.'
              );

              return `${cluster}, ${datasource}, ${schema}, ${table}`;
            },
          },
        };
        const expected = 'cluster1, datasource1, schema1, table1';
        const notice = ConfigUtils.getResourceNotices(
          resource,
          'cluster1.datasource1.schema1.table1'
        );
        const actual = notice && notice.messageHtml;

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('when there are wildcards ', () => {
    describe('when there are wildcard(s) that match', () => {
      it('returns notice', () => {
        const noticesDict = {
          '*.datasource.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.*.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.*.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.datasource.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.datasource.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.*.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.*.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.*.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.*.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.*.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.datasource.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          '*.*.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.schema.tab*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.schema.*able': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
          'cluster.datasource.schema.ta*le': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage1',
          },
        };
        const resources = [ResourceType.table, ResourceType.dashboard];
        for (const [noticeName, noticeParams] of Object.entries(noticesDict)) {
          for (let index = 0; index < resources.length; index++) {
            const resource = resources[index];
            AppConfig.resourceConfig[resource].notices = {
              [noticeName]: noticeParams,
            };
            const expected = 'testMessage1';
            const notice = ConfigUtils.getResourceNotices(
              resource,
              'cluster.datasource.schema.table'
            );
            const actual = notice && notice.messageHtml;

            expect(actual).toEqual(expected);
          }
        }
      });
    });

    describe("when there are wildcard(s) that don't match", () => {
      it('returns false', () => {
        const noticesDict = {
          '*.datasource.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.*.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.datasource.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.datasource.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.*.schema.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.datasource.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.datasource.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.*.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.*.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.datasource.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.*.*.table': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.*.schema.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          'cluster.*.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.datasource.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
          '*.b*.*.*': {
            severity: NoticeSeverity.WARNING,
            messageHtml: 'testMessage',
          },
        };
        const resources = [ResourceType.table, ResourceType.dashboard];
        for (const [noticeName, noticeParams] of Object.entries(noticesDict)) {
          for (let index = 0; index < resources.length; index++) {
            const resource = resources[index];
            AppConfig.resourceConfig[resource].notices = {
              [noticeName]: noticeParams,
            };
            const expected = false;
            const notice = ConfigUtils.getResourceNotices(
              resource,
              'cluster1.datasource1.schema1.table1'
            );
            const actual = notice && notice.messageHtml;

            expect(actual).toEqual(expected);
          }
        }
      });
    });

    describe('when there are 2 notices that match', () => {
      it('returns the last matched notice', () => {
        const resources = [ResourceType.table, ResourceType.dashboard];
        resources.forEach((resource) => {
          AppConfig.resourceConfig[resource].notices = {
            'cluster.datasource.*.*': {
              severity: NoticeSeverity.WARNING,
              messageHtml: 'testMessage',
            },
            'cluster.datasource.schema.*': {
              severity: NoticeSeverity.WARNING,
              messageHtml: 'testMessage2',
            },
          };
          const expected = 'testMessage2';
          const notice = ConfigUtils.getResourceNotices(
            resource,
            'cluster.datasource.schema.table'
          );
          const actual = notice && notice.messageHtml;

          expect(actual).toEqual(expected);
        });
      });
    });

    describe('when there are 2 notices, but only one matches', () => {
      it('returns notice', () => {
        const resources = [ResourceType.table, ResourceType.dashboard];
        resources.forEach((resource) => {
          AppConfig.resourceConfig[resource].notices = {
            'cluster.datasource.schema.*': {
              severity: NoticeSeverity.WARNING,
              messageHtml: 'testMessage2',
            },
            'cluster.datasource.schema1.*': {
              severity: NoticeSeverity.WARNING,
              messageHtml: 'testMessage',
            },
          };
          const expected = 'testMessage2';
          const notice = ConfigUtils.getResourceNotices(
            resource,
            'cluster.datasource.schema.table'
          );
          const actual = notice && notice.messageHtml;

          expect(actual).toEqual(expected);
        });
      });
    });

    describe('when there is a notice with a wildcard and dynamic message', () => {
      it('returns notice with dynamic message', () => {
        const resources = [ResourceType.table, ResourceType.dashboard];
        resources.forEach((resource) => {
          AppConfig.resourceConfig[resource].notices = {
            'cluster1.datasource1.schema1.*': {
              severity: NoticeSeverity.WARNING,
              messageHtml: (resourceName) => {
                const [cluster, datasource, schema, table] = resourceName.split(
                  '.'
                );

                return `${cluster}, ${datasource}, ${schema}, ${table}`;
              },
            },
          };
          const expected = 'cluster1, datasource1, schema1, table1';
          const notice = ConfigUtils.getResourceNotices(
            resource,
            'cluster1.datasource1.schema1.table1'
          );
          const actual = notice && notice.messageHtml;

          expect(actual).toEqual(expected);
        });
      });
    });
  });
});

describe('getFilterConfigByResource', () => {
  it('returns the filter categories for a given resource', () => {
    const testResource = ResourceType.table;
    const expectedValue =
      AppConfig.resourceConfig[testResource].filterCategories;
    expect(ConfigUtils.getFilterConfigByResource(testResource)).toBe(
      expectedValue
    );
  });
});

describe('getAnalyticsConfig', () => {
  it('returns the analytics configuration object', () => {
    const expectedValue = AppConfig.analytics;

    expect(ConfigUtils.getAnalyticsConfig()).toBe(expectedValue);
  });
});

describe('getUniqueValueStatTypeName', () => {
  it('returns the unique value stat type key name', () => {
    const expectedValue = 'test';

    AppConfig.resourceConfig[ResourceType.table].stats = {
      uniqueValueTypeName: expectedValue,
    };

    expect(ConfigUtils.getUniqueValueStatTypeName()).toBe(expectedValue);
  });
});

describe('getIconNotRequiredStatTypes', () => {
  it('returns the stat types where, if they are the only ones present, the stats icon will not be displayed', () => {
    const expectedValue = ['test'];

    AppConfig.resourceConfig[ResourceType.table].stats = {
      iconNotRequiredTypes: expectedValue,
    };

    expect(ConfigUtils.getIconNotRequiredStatTypes()).toBe(expectedValue);
  });
});

describe('getTableSortCriterias', () => {
  it('returns the sorting criterias for tables', () => {
    const expectedValue =
      AppConfig.resourceConfig[ResourceType.table].sortCriterias;

    expect(ConfigUtils.getTableSortCriterias()).toBe(expectedValue);
  });
});

describe('getBadgeConfig', () => {
  AppConfig.badges = {
    test_1: {
      style: BadgeStyle.DANGER,
      displayName: 'badge display value 1',
    },
    test_2: {
      style: BadgeStyle.DANGER,
      displayName: 'badge display value 2',
    },
  };

  it('Returns the badge config for a given badge', () => {
    const config = ConfigUtils.getBadgeConfig('test_1');
    const expectedConfig = AppConfig.badges.test_1;
    expect(config.style).toEqual(expectedConfig.style);
    expect(config.displayName).toEqual(expectedConfig.displayName);
  });

  it('Returns default badge config for unspecified badges', () => {
    const badgeName = 'Not_configured_badge';
    const badgeConfig = ConfigUtils.getBadgeConfig(badgeName);
    expect(badgeConfig.style).toEqual(BadgeStyle.DEFAULT);
    expect(badgeConfig.displayName).toEqual(badgeName);
  });
});

describe('getNavLinks', () => {
  const testNavLinks = [
    {
      label: 'TestLabel1',
      id: 'nav::testPage1',
      href: '/testPage1',
      use_router: true,
    },
    {
      label: 'TestLabel2',
      id: 'nav::testPage2',
      href: '/testPage2',
      use_router: true,
    },
  ];
  AppConfig.navLinks = [
    ...testNavLinks,
    {
      label: 'Announcements',
      id: 'nav::announcements',
      href: '/announcements',
      use_router: true,
    },
  ];

  describe('when announcements is active', () => {
    it('returns all the navLinks', () => {
      AppConfig.announcements.enabled = true;
      const actual = ConfigUtils.getNavLinks();
      const expected = AppConfig.navLinks;

      expect(actual).toEqual(expected);
    });
  });

  describe('when announcements is deactivated', () => {
    it('returns all the navLinks but the announcements', () => {
      AppConfig.announcements.enabled = false;
      const actual = ConfigUtils.getNavLinks();
      const expected = testNavLinks;

      expect(actual).toEqual(expected);
    });
  });
});

describe('feedbackEnabled', () => {
  it('returns whether or not the feaadback feature is enabled', () => {
    expect(ConfigUtils.feedbackEnabled()).toBe(
      AppConfig.mailClientFeatures.feedbackEnabled
    );
  });
});

describe('announcementsEnabled', () => {
  it('returns whether or not the announcements feature is enabled', () => {
    expect(ConfigUtils.announcementsEnabled()).toBe(
      AppConfig.announcements.enabled
    );
  });
});

describe('issueTrackingEnabled', () => {
  it('returns whether or not the issueTracking feature is enabled', () => {
    expect(ConfigUtils.issueTrackingEnabled()).toBe(
      AppConfig.issueTracking.enabled
    );
  });
});

describe('getIssueDescriptionTemplate', () => {
  it('returns an issue description template string', () => {
    AppConfig.issueTracking.issueDescriptionTemplate =
      'This is a description template';
    expect(ConfigUtils.getIssueDescriptionTemplate()).toBe(
      AppConfig.issueTracking.issueDescriptionTemplate
    );
  });
});

describe('issueTrackingProjectSelectionEnabled', () => {
  it('returns whether or not project selection within the issueTracking feature is enabled', () => {
    const config = AppConfig.issueTracking.projectSelection;
    expect(ConfigUtils.issueTrackingProjectSelectionEnabled()).toBe(
      config ? config.enabled : false
    );
  });
});

describe('getProjectSelectionTitle', () => {
  it('returns an issue description template string', () => {
    const config = AppConfig.issueTracking.projectSelection;
    if (config) config.title = 'Project key';
    expect(ConfigUtils.getProjectSelectionTitle()).toBe(
      config ? config.title : ''
    );
  });
});

describe('getProjectSelectionHint', () => {
  it('returns an issue description template string', () => {
    const config = AppConfig.issueTracking.projectSelection;
    if (config) config.inputHint = 'PROJECTKEY';
    expect(ConfigUtils.getProjectSelectionHint()).toBe(
      config ? config.inputHint : ''
    );
  });
});

describe('indexDashboardsEnabled', () => {
  it('returns whether or not the indexDashboards feature is enabled', () => {
    expect(ConfigUtils.indexDashboardsEnabled()).toBe(
      AppConfig.indexDashboards.enabled
    );
  });
});

describe('indexUsersEnabled', () => {
  it('returns whether or not the indexUsers feature is enabled', () => {
    expect(ConfigUtils.indexUsersEnabled()).toBe(AppConfig.indexUsers.enabled);
  });
});

describe('notificationsEnabled', () => {
  it('returns whether or not the notifications feature is enabled', () => {
    expect(ConfigUtils.notificationsEnabled()).toBe(
      AppConfig.mailClientFeatures.notificationsEnabled
    );
  });
});

describe('showAllTags', () => {
  it('returns whether or not to show all tags', () => {
    AppConfig.browse.showAllTags = true;
    expect(ConfigUtils.showAllTags()).toBe(AppConfig.browse.showAllTags);
    AppConfig.browse.showAllTags = false;
    expect(ConfigUtils.showAllTags()).toBe(AppConfig.browse.showAllTags);
  });
});

describe('getCuratedTags', () => {
  it('returns a list of curated tags', () => {
    AppConfig.browse.curatedTags = ['one', 'two', 'three'];
    expect(ConfigUtils.getCuratedTags()).toBe(AppConfig.browse.curatedTags);
  });
});

describe('exploreEnabled', () => {
  it('returns whether the explore function is enabled', () => {
    AppConfig.tableProfile.isExploreEnabled = true;
    expect(ConfigUtils.exploreEnabled()).toBe(
      AppConfig.tableProfile.isExploreEnabled
    );
    AppConfig.tableProfile.isExploreEnabled = false;
    expect(ConfigUtils.exploreEnabled()).toBe(
      AppConfig.tableProfile.isExploreEnabled
    );
  });
});

describe('generateExploreUrl', () => {
  const tableData = {
    badges: [],
    cluster: 'cluster',
    columns: [],
    dashboards: [],
    database: 'database',
    is_editable: false,
    is_view: false,
    key: '',
    schema: 'schema',
    name: 'table_name',
    last_updated_timestamp: 12321312312,
    description: '',
    table_writer: { application_url: '', description: '', id: '', name: '' },
    table_apps: [],
    partition: {
      is_partitioned: true,
      key: 'partition_key',
      value: 'partition_value',
    },
    table_readers: [],
    source: { source: '', source_type: '' },
    resource_reports: [],
    watermarks: [],
    programmatic_descriptions: {},
  };

  it('calls `exploreUrlGenerator` with table metadata', () => {
    const exploreUrlGeneratorSpy = jest.spyOn(
      AppConfig.tableProfile,
      'exploreUrlGenerator'
    );
    ConfigUtils.generateExploreUrl(tableData);
    expect(exploreUrlGeneratorSpy).toBeCalledWith(
      tableData.database,
      tableData.cluster,
      tableData.schema,
      tableData.name,
      tableData.partition.key,
      tableData.partition.value
    );
  });

  it('excludes partition data if it does not exist', () => {
    const mockTableData = {
      ...tableData,
      partition: {
        is_partitioned: false,
      },
    };

    const exploreUrlGeneratorSpy = jest.spyOn(
      AppConfig.tableProfile,
      'exploreUrlGenerator'
    );
    ConfigUtils.generateExploreUrl(mockTableData);
    expect(exploreUrlGeneratorSpy).toBeCalledWith(
      mockTableData.database,
      mockTableData.cluster,
      mockTableData.schema,
      mockTableData.name
    );
  });
});

describe('numberFormat', () => {
  it('returns number format defined in config', () => {
    const actual = ConfigUtils.getNumberFormat();
    const expected = AppConfig.numberFormat;
    expect(actual).toBe(expected);
  });
});

describe('getDocumentTitle', () => {
  it('returns documentTitle defined in config', () => {
    const actual = ConfigUtils.getDocumentTitle();
    const expected = AppConfig.documentTitle;
    expect(actual).toBe(expected);
  });
});

describe('getLogoTitle', () => {
  it('returns logoTitle defined in config', () => {
    const actual = ConfigUtils.getLogoTitle();
    const expected = AppConfig.logoTitle;
    expect(actual).toBe(expected);
  });
});

describe('isTableListLineageEnabled', () => {
  it('returns isTableListLineageEnabled defined in config', () => {
    const actual = ConfigUtils.isTableListLineageEnabled();
    const expected = AppConfig.tableLineage.inAppListEnabled;
    expect(actual).toBe(expected);
  });
});

describe('isColumnListLineageEnabled', () => {
  it('returns isColumnListLineageEnabled defined in config', () => {
    const actual = ConfigUtils.isColumnListLineageEnabled();
    const expected = AppConfig.columnLineage.inAppListEnabled;
    expect(actual).toBe(expected);
  });
});

describe('isTableLineagePageEnabled', () => {
  it('returns isTableLineagePageEnabled defined in config', () => {
    const actual = ConfigUtils.isTableLineagePageEnabled();
    const expected = AppConfig.tableLineage.inAppPageEnabled;
    expect(actual).toBe(expected);
  });
});

describe('isColumnLineagePageEnabled', () => {
  it('returns isColumnLineagePageEnabled defined in config', () => {
    const actual = ConfigUtils.isColumnLineagePageEnabled();
    const expected = AppConfig.columnLineage.inAppPageEnabled;
    expect(actual).toBe(expected);
  });
});

describe('getColumnLineageLink', () => {
  it('calls the column lineage link with the right params', () => {
    const tableData = {
      badges: [],
      cluster: 'cluster',
      columns: [],
      dashboards: [],
      database: 'database',
      is_editable: false,
      is_view: false,
      key: '',
      schema: 'schema',
      name: 'table_name',
      last_updated_timestamp: 12321312312,
      description: '',
      table_writer: {
        application_url: '',
        description: '',
        id: '',
        name: '',
      },
      table_apps: [],
      partition: {
        is_partitioned: true,
        key: 'partition_key',
        value: 'partition_value',
      },
      table_readers: [],
      source: { source: '', source_type: '' },
      resource_reports: [],
      watermarks: [],
      programmatic_descriptions: {},
    };
    const columnName = 'column_name';
    const actual = ConfigUtils.getColumnLineageLink(tableData, columnName);
    const expected = AppConfig.columnLineage.urlGenerator(
      tableData.database,
      tableData.cluster,
      tableData.schema,
      tableData.name,
      columnName
    );
    expect(actual).toBe(expected);
  });
});

describe('isTableQualityCheckEnabled', () => {
  it('returns isTableQualityCheckEnabled defined in config', () => {
    const actual = ConfigUtils.isTableQualityCheckEnabled();
    const expected = AppConfig.tableQualityChecks.isEnabled;
    expect(actual).toBe(expected);
  });
});

describe('getMaxNestedColumns', () => {
  it('returns nestedColumns.maxNestedColumns defined in config', () => {
    AppConfig.nestedColumns.maxNestedColumns = 1000;
    const actual = ConfigUtils.getMaxNestedColumns();
    const expected = AppConfig.nestedColumns.maxNestedColumns;
    expect(actual).toBe(expected);
  });
});

describe('getProductToursFor', () => {
  describe('when perfect pathname matching', () => {
    it('returns the ProductTour setup defined in config', () => {
      AppConfig.productTour = {
        '/': [
          {
            isFeatureTour: false,
            isShownOnFirstVisit: true,
            isShownProgrammatically: true,
            steps: [
              {
                target: '.nav-bar-left a',
                title: 'Welcome to Amundsen',
                content:
                  'Hi!, welcome to Amundsen, your data discovery and catalog product!',
              },
              {
                target: '.search-bar-form .search-bar-input',
                title: 'Search for resources',
                content:
                  'Here you will search for the resources you are looking for',
              },
            ],
          },
        ],
      };
      const { result: actual } = ConfigUtils.getProductToursFor('/');
      const expected = AppConfig.productTour['/'];

      expect(actual).toBe(expected);
    });
  });

  describe('when wildcard pathname matching', () => {
    it('returns the ProductTour setup defined in config', () => {
      AppConfig.productTour = {
        '/table_detail/*': [
          {
            isFeatureTour: false,
            isShownOnFirstVisit: true,
            isShownProgrammatically: true,
            steps: [
              {
                target: '.nav-bar-left a',
                title: 'Welcome to Amundsen',
                content:
                  'Hi!, welcome to Amundsen, your data discovery and catalog product!',
              },
            ],
          },
        ],
      };
      const { result: actual } = ConfigUtils.getProductToursFor(
        '/table_detail/gold/hive/core/test_table'
      );
      const expected = AppConfig.productTour['/table_detail/*'];

      expect(actual).toBe(expected);
    });
  });
});

describe('getSearchResultsPerPage', () => {
  it('returns searchPagination.resultsPerPage defined in config', () => {
    AppConfig.searchPagination.resultsPerPage = 10;
    const actual = ConfigUtils.getSearchResultsPerPage();
    const expected = AppConfig.searchPagination.resultsPerPage;
    expect(actual).toBe(expected);
  });
});
