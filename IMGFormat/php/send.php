<?php
session_start();
if(!$_POST)
return false;
$dataUrl = trim(mb_convert_encoding($_POST['url'],'gbk','utf-8'));
$type = $_POST['type'];

$path = "../";
$random = time().rand(1,10000);
$dir  = "source/".$random."/";
$name = rand(10000,20000).$type;

if(!is_dir($path.$dir))
{
    mkdir($path.$dir);
    chmod($path.$dir,0777);
}

$newImageData = @file_get_contents($dataUrl);

$createImg = fopen($path.$dir.$name,'w+');
fwrite($createImg,$newImageData);
fclose($createImg);

$_SESSION['dir'] = $path.$dir;
$_SESSION['file']= $name;

echo $dir.$name;
?>