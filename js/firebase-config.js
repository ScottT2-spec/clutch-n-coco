/**
 * Firebase configuration for Clutch 'N' Coco
 */
var firebaseConfig = {
  apiKey: "AIzaSyD61HVcCtGIUt_VdvTh9ZUxU8I0sJWJ9sM",
  authDomain: "clutch-n-coco.firebaseapp.com",
  projectId: "clutch-n-coco",
  storageBucket: "clutch-n-coco.firebasestorage.app",
  messagingSenderId: "498959726356",
  appId: "1:498959726356:web:c4aedf4fb77dde7f523401"
};

// Admin emails — these accounts can access the admin panel
// Add up to 4 admin emails. Leave empty strings as placeholders.
var ADMIN_EMAILS = [
  "scottantwi930@gmail.com",
  "brownskinako@gmail.com",
  "yaaasieduaaddae17@gmail.com",
  ""    // Admin 4 — add email here
];

// Legacy single-admin variable (for backward compat)
var ADMIN_EMAIL = ADMIN_EMAILS[0];
