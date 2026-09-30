<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.php");
    exit;
}

/* ===========================
   1. Récupération des données
=========================== */

$name = trim($_POST['name'] ?? '');
$prenom = trim($_POST['prenom'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];

/* ===========================
   2. Validation
=========================== */

if (empty($name)) {
    $errors[] = "Le nom est obligatoire";
}

if (empty($prenom)) {
    $errors[] = "Le Prenom est obligatoire";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email invalide";
}

if (empty($subject)) {
    $errors[] = "Sujet obligatoire";
}

if (empty($message)) {
    $errors[] = "Message obligatoire";
}

/* ===========================
   3. Envoi du mail
=========================== */

if (empty($errors)) {

    $to = "alexisdeloisydev@gmail.com";   // ← CHANGE ICI
    $mail_subject = "Message portfolio : $subject";

    $mail_content = "
    Nouveau message depuis ton portfolio :

    Nom : $name
    Prenom : $prenom
    Email : $email
    Sujet : $subject

    Message :
    $message
    ";

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($to, $mail_subject, $mail_content, $headers)) {
        $_SESSION['success'] = "Message envoyé avec succès";
    } else {
        $_SESSION['error'] = "Erreur lors de l'envoi";
    }

} else {
    $_SESSION['error'] = implode("<br>", $errors);
}

header("Location: index.php#contact");
exit;