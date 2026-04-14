/**
 * Handles API interactions with Grafana via the Grafana HTTP API.
 * 
 * @see https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/
 * @author Gerard de Jong
 * @copyright Glitchy Software 2025
 */

import { GrafanaUnitHandler } from '../src/grafana-unit-handler'

export class GrafanaAPI {
    private static SUPPORTED_TIME_RANGES = [
        "now-5m", "now-15m", "now-30m",
        "now-1h", "now-3h", "now-5h", "now-12h", "now-24h",
        "now-2d", "now-7d", "now-30d", "now-90d",
        "now-6M", "now-1y", "now-2y", "now-5y"
    ];    

    public static async getHealthStatus(url: string): Promise<GrafanaHealthCheckResponse> {
        const requestUrl = `${url}/health`;
        const response = await fetch(requestUrl);
        await GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaHealthCheckResponse;
    }

    public static async getUserStatus(url: string, token: string): Promise<GrafanaUserStatusResponse> {
        const requestUrl = `${url}/user`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        await GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaUserStatusResponse;
    }


    public static async getDashbaords(url: string, token: string): Promise<GrafanaDashboardSearchResponse[]> {
        const requestUrl = `${url}/search`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        await GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaDashboardSearchResponse[];
    }

    public static async getDataSources(url:string, token:string): Promise<GrafanaDataSourceResponse[]> {
        const requestUrl = `${url}/datasources`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        await  GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaDataSourceResponse[];
    }

    public static async getDataSource(url:string, token:string, datasource:string): Promise<GrafanaDataSourceResponse> {
        const requestUrl = `${url}/datasources/uid/${datasource}/`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        await GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaDataSourceResponse;
    }

    public static async query(url:string, token:string, datasourceId:string, expression:string, timeRange:string = "now-5m", isRange:boolean = true): Promise<GrafanaQueryResponse> {
        try {
            if(!GrafanaAPI.SUPPORTED_TIME_RANGES.includes(timeRange)) { // Default to last 5 minutes if an unsupported time range is provided.
                timeRange = "now-5m";
            }

            const requestUrl = `${url}/ds/query/`;
            const requestBody = JSON.stringify({
                "queries": [
                    {
                        "refId": "StreamDeck",
                        "datasourceId": Number(datasourceId),
                        "queryType": "timeSeriesQuery",
                        "expr": expression.replace(/[\n\r\t]/gm, ""), // Remove linebreaks & tab characters
                        "range": isRange,
                        "instant": true, // Appropriate for single stat / gauge visualizations
                        //"format": "time_series"
                    }
                ],
                "from": timeRange,
                "to": "now"
            });

            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: requestBody
            });

            await GrafanaAPI.validateResponse(response, requestUrl + " >> " + requestBody);

            const data = (await response.json()) as GrafanaQueryResponse;
            return data;
        }
        catch(e) {
            throw new Error(`${e}`);
        }
    }

    public static getStatDisplayValue(queryResult: GrafanaQueryResponse, unit: string): string {
        for (let frame of queryResult.results['StreamDeck'].frames) {
            const timestamps = frame.data.values[0];
            const measurements = frame.data.values[1];

            if (measurements === undefined) {
                return "No Data";
            }

            if (timestamps.length === 1 && measurements.length === 1) {
                const formattedValue = GrafanaUnitHandler.formatGrafanaValue(measurements[0], unit, 1);
                return formattedValue;
            }
        }
        return "Error";
    }
    
    static getGaugeMetric(queryResult: GrafanaQueryResponse): number {
        for (let frame of queryResult.results['StreamDeck'].frames) {
            const timestamps = frame.data.values[0];
            const measurements = frame.data.values[1];

            if (measurements === undefined) {
                return 0;
            }

            if (timestamps.length === 1 && measurements.length === 1) {
                return Math.round((measurements[0] + Number.EPSILON) * 10) / 10;
            }
        }
        return 0;
    }

    public static getStatDisplayMetrics(queryResult: GrafanaQueryResponse): number[] {
        for (let frame of queryResult.results['StreamDeck'].frames) {
            const timestamps = frame.data.values[0];
            const measurements = frame.data.values[1];

            if (measurements === undefined) {
                return [];
            }
            
            if (timestamps.length > 1 && measurements.length > 1) {
                return measurements as number[];
            }
        }
        return [];
    }

    static async getDashboard(url: string, token: string, dashboardUid: string): Promise<GrafanaDashboardResponse> {
        const requestUrl = `${url}/dashboards/uid/${dashboardUid}/`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        await GrafanaAPI.validateResponse(response, requestUrl);

        return (await response.json()) as GrafanaDashboardResponse;
    }
    
    public static getDashboardPanelThresholds(panel: GrafanaDashboardPanel): GrafanaDashboardPanelThresholdStep[] {
        let thresholds = [];
        for (const step of panel.fieldConfig.defaults.thresholds.steps) {
            thresholds.push({
                color: GrafanaAPI.rgbaToHex(step.color),
                value: step.value ?? 0
            });
        }
        return thresholds;
    }
    
    // TODO: This whole function is fucked! Thanks AI!
    private static rgbaToHex(rgba: string): string {
        const match = rgba
        .replace(/\s+/g, "")
        .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,([01]?\.?\d*))?\)$/);

        if (!match) {
          throw new Error(`Invalid RGBA color: ${rgba}`);
        }
                  //Math.min(Math.max(value, min), max);
        const r = GrafanaAPI.clamp(parseInt(match[1], 10), 0, 255);
        const g = GrafanaAPI.clamp(parseInt(match[2], 10), 0, 255);
        const b = GrafanaAPI.clamp(parseInt(match[3], 10), 0, 255);
        const a = match[4] !== undefined
        ? GrafanaAPI.clamp(Math.round(parseFloat(match[4]) * 255), 0, 255)
        : 255;

        const toHex = (n: number) => n.toString(16).padStart(2, "0");

        return a === 255
        ? `#${toHex(r)}${toHex(g)}${toHex(b)}`
        : `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }

    private static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    public static getDashboardPanelExpressionTemplateLabels(expression: string): Set<string> {
        // Regex explanation:
        // \$             - Matches the literal dollar sign
        // (              - Start capturing group
        //   \{[a-zA-Z_]\w*\}  - Matches ${variable_name}
        //   |                 - OR
        //   [a-zA-Z_]\w* - Matches $variable_name
        // )              - End capturing group
        const regex = /\$(?!__)(\{[a-zA-Z_]\w*\}|[a-zA-Z_]\w*)/g;
        const matches = expression.match(regex);

        if (!matches) {
            return new Set([]);
        }

        return new Set(matches); // Use a Set to ensure we only return unique variable names
    }

    public static getDashboardPanelExpressionTemplateAssignedLabels(expression: string): Set<string> {
        // instance="$node" -> extract: instance
        // job="$job" -> extract: job
        const regex = /(\w+)\s*=\s*"\$[^"]+"/g;
        const results = [];
        let match;

        while ((match = regex.exec(expression)) !== null) {
            results.push(match[1]); // capture group = label name
        }

        return new Set(results);
    }

    public static async getTemplateVariableSelectableOptions(url: string, token: string, datasourceId:string, labelName: string): Promise<Set<string>> {
        try {
            const requestUrl = `${url}/datasources/proxy/${datasourceId}/api/v1/label/${labelName}/values`;
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            await GrafanaAPI.validateResponse(response, requestUrl);

            const responseData = (await response.json()) as {status:string, data:string[]};

            if (responseData.status == "success") {
                return new Set(responseData.data);
            }
            return new Set();
        }
        catch(e) {
            throw new GrafanaTemplateLabelError(`Data Source Lable Error: ${e}`);
        }
    }

    private static async validateResponse(response: Response, context: string): Promise<void> {
        if (response.ok) { // 200 - 299
            return;
        }

        if(response.status === 401) {
            const responseJson = (await response.json());
            if("message" in responseJson) {
                throw new GrafanaAuthenticationError(responseJson.message);
            }
            throw new GrafanaAuthenticationError(`Unknown authentication error: ${response.status} ${context}`);
        }

        if(response.status === 400) {
            // const responseJson = (await response.json());
            // if("message" in responseJson) {
            //     throw new GrafanaQueryError(responseJson.message);
            // }

            throw new GrafanaQueryError(`Query error: ${response.status} ${context}`);
        }
        
        else {
            throw new Error(`API Error! Status: ${response.status} ${context}`);
        }
    }
}

export class GrafanaAuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
        Object.setPrototypeOf(this, GrafanaAuthenticationError.prototype);
    }
}

export class GrafanaQueryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GrafanaQueryError";
        Object.setPrototypeOf(this, GrafanaQueryError.prototype);
    }
}

export class GrafanaTemplateLabelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GrafanaTemplateLabelError";
        Object.setPrototypeOf(this, GrafanaTemplateLabelError.prototype);
    }
}

export interface GrafanaHealthCheckResponse {
    database: string;
    version: string;
    commit: string;
}

export interface GrafanaUserStatusResponse {
    name: string;
    isDisabled: boolean;
    messageId: string;
}

export interface GrafanaDataSourceResponse {
    id: number;
    uid: string;
    name: string;
    typeName: string;
}

export interface GrafanaDashboardSearchResponse {
    uid: string;
    title: string;
    url: string;
}

export interface GrafanaDashboardPanelThresholdStep {
    color: string;
    value?: number;
}

export interface GrafanaDashboardPanelTarget {
    expr: string;
}

export interface GrafanaDashboardPanelTemplate {
    label: string;
    name: string;
    query: string | { query: string };
    type: string; 
}

export interface GrafanaDashboardPanel {
    id: number;
    title: string;
    description: string;
    type: string;
    datasource: {
        type: string;
        uid: string;
    }   
    fieldConfig: {
        defaults: {
            thresholds: {
                mode: string;
                steps: GrafanaDashboardPanelThresholdStep[];
            };
            unit: string; // percent, percentunit, bytes, bps, iops, Bps, ops, short, rothz, hertz, celsius, bool_yes_no, rotrpm
        };
    };
    options: {
        graphMode: string;
    };
    targets: GrafanaDashboardPanelTarget[];
    
}

export interface GrafanaDashboardResponse {
    dashboard: {
        panels: GrafanaDashboardPanel[];
        uid: string;
        title: string;
        templating : {
            list: {
                name: string;
                label: string;
                query: string | {
                    query: string;
                    refId: string;
                };
                type: string;
            }[]
        }
    };
    meta: {
        url:string;
    }
}

export interface GrafanaQueryFrame {
    data: {
        values: number[][]
    };
}

export interface GrafanaQueryResponse {
    results: {
        StreamDeck: { // Default RefId
            frames: GrafanaQueryFrame[];
        }
    };
}
