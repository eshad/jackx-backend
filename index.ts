import app from "./src/app";
import { Config } from "./src/configs/config";
import { setupSwagger } from "./src/swagger"; // adjust the path if needed

const PORT = Config.port || 3000;

// Setup Swagger with the configured app
setupSwagger(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});