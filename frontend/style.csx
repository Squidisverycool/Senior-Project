* {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  margin: 0;
  background: #f9fafb;
  color: #111827;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  font-weight: 600;
  font-size: 18px;
}

.nav a {
  margin-left: 20px;
  text-decoration: none;
  color: #6b7280;
}

/* Main */
.main {
  max-width: 900px;
  margin: 60px auto;
  text-align: center;
  padding: 0 20px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 40px;
}

/* Cards */
.card-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.card {
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  padding: 32px;
  width: 360px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.card h3 {
  margin-top: 16px;
}

.card p {
  color: #6b7280;
  font-size: 14px;
}

/* Icons */
.icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto;
}

.upload {
  background: #e0ecff;
}

.record {
  background: #f3e8ff;
}

/* Buttons */
button {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.primary {
  background: #111827;
  color: white;
}

.secondary {
  background: white;
  border: 1px solid #a855f7;
  color: #7c3aed;
}

/* Tips */
.tips {
  margin-top: 40px;
  background: linear-gradient(90deg, #eef2ff, #f8fafc);
  border-radius: 12px;
  padding: 24px;
  text-align: left;
}

.tips h4 {
  margin-top: 0;
}

.tips ul {
  padding-left: 20px;
}

.tips li {
  margin-bottom: 8px;
  color: #374151;
}

.results {
  margin-top: 40px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}
