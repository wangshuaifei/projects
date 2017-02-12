<?php
session_start();
if(!$_POST)
return false;

$del = $_POST['del'];

if($del)
{
    @unlink($_SESSION['dir'].$_SESSION['file']);
    rmdir($_SESSION['dir']);
}

session_destroy();
?>