# Stream Deck Grafana Core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Beta Release](https://img.shields.io/badge/Status-Beta-orange)](https://github.com/glitchy-software/stream-deck-grafana-core/releases)

A simple core module for integrating Grafana metrics into peripheral vision displays, originally developed for and used by the [Grafana plugin](https://marketplace.elgato.com/product/grafana-8a8b4a9d-6633-4583-88b6-1cc8fab45600) for the [Elgato Stream Deck](https://www.elgato.com/ww/en/s/explore-stream-deck). This library enables developers to create their own implementations that bring Grafana stats and gauges directly to your workspace, keeping critical system metrics always visible without burying them in browser tabs.

## 🚀 Beta Release Available!

We're excited to invite you to test our beta release and experience the future of observability! Download the latest beta from our [Releases page](https://github.com/glitchy-software/stream-deck-grafana-core/releases) and let us know what you think.

### What You Can Do Right Now:
- Display live Grafana stats and gauges on your Stream Deck
- Press any key to instantly open the full dashboard in your browser
- Monitor system health at a glance during incidents
- Customize layouts for your specific workflows

## 📧 Feedback Welcome!

Your feedback is invaluable as we refine this tool for production use. Please share your experiences, bug reports, feature requests, or any other thoughts via email: **contact@glitchysoftware.com**. We read every message and are committed to making this the best observability tool possible.

## 🎯 Purpose of This Repository

This repository contains the core Grafana API interaction module that powers our Stream Deck plugin. While we've built it for the Stream Deck ecosystem, the underlying code is platform-agnostic and designed to be extensible. Our vision is to enable developers to create implementations for any peripheral display device—think smart displays, secondary monitors, wearable tech, or even AR glasses.

**Use this code to:**
- Build Grafana integrations for other hardware platforms
- Create custom dashboard viewers for specialized workflows
- Experiment with new ways to keep observability in your peripheral vision
- Contribute back improvements that benefit the entire community

## ✨ Key Features

- **Secure API Integration**: AES-256 encrypted token storage with read-only access
- **Real-time Metrics**: Live updates from Grafana panels (stats, gauges, etc.)
- **Platform Agnostic**: Core logic works with any display device
- **Auto Configuration**: Pull layouts directly from existing Grafana dashboards
- **Manual Overrides**: Full customization for bespoke implementations
- **Battle-Tested**: Featured at GrafanaCon 2026 with real production patterns

## 🛠 Installation

### Prerequisites
- Node.js 16+
- Access to a Grafana instance with API access
- A read-only service account token (for security)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/glitchy-software/stream-deck-grafana-core.git
   cd stream-deck-grafana-core
   ```

2. **Start Interacting with the Grafana API:**
   ```javascript
   const healthStatus = await GrafanaAPI.getHealthStatus("http://your-server:3000/api");

   ```

## 📖 Usage Examples

Here are some practical examples demonstrating how to use the core classes in this library. These are based on the unit tests and showcase common use cases for integrating with Grafana.

### 1. Encrypting and Decrypting Sensitive Data

Use the `EncryptionHandler` to securely store and retrieve sensitive information like API tokens.

```typescript
import { EncryptionHandler } from './src/encryption-handler';

// Generate a new encryption key
const key = await EncryptionHandler.generateKey();

// Export the key for storage (e.g., in a secure vault)
const exportedKey = await EncryptionHandler.exportKey(key);

// Later, import the key back
const importedKey = await EncryptionHandler.importKey(exportedKey);

// Encrypt a sensitive token
const sensitiveData = "glsa_YourApiTokenHereBn9RhqZaaOC1f2slN_c231157";
const encrypted = await EncryptionHandler.encrypt(importedKey, sensitiveData);

// Decrypt it back
const decrypted = await EncryptionHandler.decrypt(importedKey, encrypted.iv, encrypted.data);

console.log(decrypted); // Outputs: glsa_YourApiTokenHereBn9RhqZaaOC1f2slN_c231157
```

### 2. Checking Grafana Health Status

Verify that your Grafana instance is running and accessible.

```typescript
import { GrafanaAPI } from './src/grafana-api';

const grafanaUrl = "http://your-server:3000/api";
const healthStatus = await GrafanaAPI.getHealthStatus(grafanaUrl);

console.log(`Grafana Version: ${healthStatus.version}`); // e.g., Grafana Version: 12.x.x
```

### 3. Fetching Available Dashboards

Retrieve a list of dashboards from your Grafana instance.

```typescript
import { GrafanaAPI } from './src/grafana-api';

const token = "glsa_YourApiTokenHereBn9RhqZaaOC1f2slN_c231157";
const dashboards = await GrafanaAPI.getDashbaords(grafanaUrl, token);

dashboards.forEach(dashboard => {
  console.log(`Dashboard: ${dashboard.title} (UID: ${dashboard.uid})`);
});
```

### 4. Formatting Metric Values with Units

Use the `GrafanaUnitHandler` to format numerical values with appropriate units, just like Grafana does.

```typescript
import { GrafanaUnitHandler } from './src/grafana-unit-handler';

// Format bytes
const formattedBytes = GrafanaUnitHandler.formatGrafanaValue(1536, "bytes", 2);
console.log(formattedBytes); // Outputs: 1.50 KiB

// Format percentages
const formattedPercent = GrafanaUnitHandler.formatGrafanaValue(0.85, "percentunit", 1);
console.log(formattedPercent); // Outputs: 85.0%

// Format data rates
const formattedBps = GrafanaUnitHandler.formatGrafanaValue(5000000, "Bps", 2);
console.log(formattedBps); // Outputs: 4.77 MB/s
```

### 5. Querying Metrics from a Data Source

Perform a query against a Grafana data source to retrieve live metrics.

```typescript
import { GrafanaAPI } from './src/grafana-api';

const datasourceId = "1"; // ID of your Prometheus data source
const expression = "100 * (1 - avg(rate(node_cpu_seconds_total{mode=\"idle\"}[$__rate_interval])))";
const queryResult = await GrafanaAPI.query(grafanaUrl, token, datasourceId, expression);

const displayValue = GrafanaAPI.getStatDisplayValue(queryResult, "percentunit");
console.log(`CPU Usage: ${displayValue}`);
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or creating implementations for new platforms:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
npm run dev
npm test
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Grafana Labs** for their incredible support and for featuring our work at [GrafanaCon 2026](https://grafana.com/events/grafanacon/agenda/micro-dashboards-improve-incident-response/). Their commitment to the observability community made this project possible.
- The SRE and DevOps community for inspiring us to think differently about incident response
- All our beta testers who provided invaluable feedback during development

## 📞 Contact & Support

- **Email:** contact@glitchysoftware.com
- **Website:** [glitchysoftware.com](https://glitchysoftware.com)
- **GitHub Issues:** [Report bugs or request features](https://github.com/glitchy-software/stream-deck-grafana-core/issues)
- **Documentation:** [Full setup guide](https://glitchysoftware.com/grafana/setup-guide.php)

## 🔮 Roadmap

- [ ] Multi-platform SDK releases
- [ ] Additional panel types support (bar graphs)
- [ ] Advanced alerting integrations
- [ ] Community showcase of custom implementations

---

**Built with ❤️ by Glitchy Software**  
*Keeping observability in your peripheral vision*
