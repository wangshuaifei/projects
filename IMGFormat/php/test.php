<?php

/**
 * @author phpadmin
 * @copyright 2015
 */
/*$filepath = trim("http://pic2.ooopic.com/01/26/61/83bOOOPIC72.jpg");
$fr = fopen($filepath,"r");

if(strstr($filepath,"://"))
{
    while($data=@fread($fr,500000)){   
        $string.=$data;   
    }
}

fclose($fr);
echo $string;*/
echo file_get_contents("http://pic2.ooopic.com/01/26/61/83bOOOPIC72.jpg");
?>