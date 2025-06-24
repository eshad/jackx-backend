import app from "./src/app";
import { Config } from "./src/configs/config";

const PORT = Config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});