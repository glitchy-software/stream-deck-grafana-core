import exp from 'constants';
import { GrafanaAPI, GrafanaAuthenticationError } from '../src/grafana-api';

describe('Testing Grafana API', () => {
  const testUrl = "http://your-server:3000/api";
  const testToken = "glsa_YourApiTokenHereBn9RhqZaaOC1f2slN_c231157";

  test('Grafana API should return a valid health status', async () => {
    const healthStatus = await GrafanaAPI.getHealthStatus(testUrl);

    expect(healthStatus).toBeDefined();
    expect(typeof healthStatus.version).toBe('string');
    expect(healthStatus.version.substring(0,2)).toBe('12');
  });

  test.skip('Grafana API should return validate user.', async () => {
    try {
      const userResponse = await GrafanaAPI.getUserStatus(testUrl, "invalid_api_key");
    }
    catch(error) {

      const isAuthenticationError: boolean = error instanceof GrafanaAuthenticationError;

      //expect(isAuthenticationError).toBe(true);

      // expect(error.name).toBe('GrafanaAuthenticationError');


      // if (error instanceof GrafanaAuthenticationError) {
      //   process.stderr.write(`Authentication Error: ${error.message}`);
      // } 
      // else {
      //   process.stderr.write(`Standard Error: ${error}`);
      // }
    }
        
    //const userStatus = await GrafanaAPI.getUserStatus(testUrl, testToken);
    
    //expect(userStatus).toBeDefined();
    // expect(typeof userStatus.version).toBe('string');
    // expect(userStatus.version.substring(0,2)).toBe('12');
  });

  

  test.skip('Test Grafana Dashboard Search', async () => {
    const dashboards = await GrafanaAPI.getDashbaords(testUrl, testToken);

    expect(dashboards).toBeDefined();
    expect(dashboards.length).toBeGreaterThan(0);

    dashboards.forEach((db) => {
      process.stderr.write(`Dashboard: ${db.title} (Type: ${db.url}, UID: ${db.uid})\n`);
    });
  });

  test.skip('Test Grafana Dashbaord information extraction.', async () => {
    const dashbaordResponseData = await GrafanaAPI.getDashboard(testUrl, testToken, "rYdddlPWk");

    expect(dashbaordResponseData).toBeDefined();
    process.stderr.write(`Dashboard Name: ${dashbaordResponseData.dashboard.title}\n\n`);

    expect(dashbaordResponseData.dashboard.panels.length).toBeGreaterThan(0);

    dashbaordResponseData.dashboard.panels.forEach((panel) => {
      if (panel.type === 'stat' || panel.type === 'gauge') {
        process.stderr.write(`${panel.title} (${panel.type.charAt(0).toUpperCase() + panel.type.slice(1)})\n`);
        process.stderr.write(`\t Description: ${panel.description}\n`);

        process.stderr.write(`\t Datasource: ${panel.datasource.type.charAt(0).toUpperCase() + panel.datasource.type.slice(1)} (${panel.datasource.uid})\n`);

        panel.fieldConfig.defaults.thresholds.steps.forEach((step, index) => {
           process.stderr.write(`\t\t Step ${index}: Color ${step.color} Value ${step.value}\n`);
        });
        
        panel.targets.forEach((target, index) => {
           process.stderr.write(`\t Expression ${target.expr}\n`);
        });
      }
    });

  });

  test('Grafana API Datasource Test', async () => {
    const dataSource = await GrafanaAPI.getDataSource(testUrl, testToken, "deox70ids6hvkb");
    expect(dataSource).toBeDefined();
    expect(dataSource.id).toEqual(1);
  
    process.stderr.write(`\t Query Test Results: ${dataSource}\n`);
  });

  test.skip('Grafana API Query Test', async () => {
    const results = await GrafanaAPI.query(testUrl, testToken, "1", "100 * (1 - avg(rate(node_cpu_seconds_total{mode=\"idle\", instance=\"10.0.1.111:9100\}[$__rate_interval])))");
    expect(results).toBeDefined();

    
    process.stderr.write(`\t Query Test Results: ${results}\n`);
  });

  test('Test Expression Template Label Extraction from Queries', () => {
    const testExpression = `(1 - (node_memory_MemAvailable_bytes{instance="$node", job="$job"} / node_memory_MemTotal_bytes{instance="$node", job="$job"})) * 100`;
    const matches = GrafanaAPI.getDashboardPanelExpressionTemplateLabels(testExpression);
    
    expect(matches).toBeDefined();
    expect(matches.size).toBeGreaterThan(0);

    for (const match of matches) {
      process.stderr.write(`Found template variable: ${match}\n`);
    }
  });

  test.skip('Test retrieving all the template variable expressions', async () => {
    const response = await GrafanaAPI.getDashboard(testUrl, testToken, "rYdddlPWk");
    expect(response).toBeDefined();

    // const templateLabelsExpressions = await GrafanaAPI.getDashboardTemplateLabelsExpressions(response);
    // for (const label of templateLabelsExpressions) {
    //   expect(label).toBeDefined();
    //   process.stderr.write(`\t Template variable expression ${label}\n`);
    // }

  });



  test('Test retrieving all the template variable options', async () => {
    //const label = "job";
    //const label = "node";
    const label = "instance";
    const templateLabelOptions = await GrafanaAPI.getTemplateLabelOptions(testUrl, testToken, "1", label);
    expect(templateLabelOptions).toBeDefined();

    for (const option of templateLabelOptions) {
      expect(option).toBeDefined();
      process.stderr.write(`\t Template variable option for ${option}\n`);
    }
  });
});
