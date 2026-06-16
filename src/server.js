import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Aquasations API is running on port http://localhost:${PORT}`);
});
export default app;
