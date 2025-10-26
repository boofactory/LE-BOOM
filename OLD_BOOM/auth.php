<?php
session_start();

// Informations de connexion
define('USERNAME', 'boo-team');
define('PASSWORD_HASH', password_hash('BOO1304Cossonay!', PASSWORD_DEFAULT));

function isAuthenticated() {
    return isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
}

function authenticate($username, $password) {
    if ($username === USERNAME && password_verify($password, PASSWORD_HASH)) {
        $_SESSION['authenticated'] = true;
        return true;
    }
    return false;
}

function logout() {
    session_destroy();
    session_start();
}

// Rediriger vers la page de connexion si non authentifié
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: /login.php');
        exit;
    }
}