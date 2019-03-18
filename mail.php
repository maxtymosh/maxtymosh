<?php

$json = file_get_contents('php://input');// Принимаю поток
$post = json_decode($json, true); // декодер json для php

print_r($post);

$space = $post[space];
$writerCategory = $post[writerCategory];
$sources =$post[sources];
$slides = $post[slides];
$level = $post[level];
$papertype =$post[papertype];
$subject = $post[subject];
$deadline = $post[deadline];
$pages = $post[pages];

$extra1 = $post[extras][0]; //A+ first attempt quality + 50 USD
$extra2 = $post[extras][1]; //Get a copy of sources used + 14.95 USD
$extra3 = $post[extras][2]; //Send SMS on completion + 2 USD
$extra4 = $post[extras][3]; //Get writer's samples + 5 USD

    $usermail = "maxtymosh@gmail.com";
    $sendto  = "maxtymosh@gmail.com";
    $subject = "Cristrage.com";
    // Header
    $headers  = "From: info@pornhub.com" . strip_tags($usermail) . "\r\n";
    $headers .= "Reply-To: ". strip_tags($usermail) . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html;charset=utf-8 \r\n";
    // Body
    $msg  = "<html><body style='font-family:Arial,sans-serif;'>";
    $msg .= "<h2 style='font-weight:bold;border-bottom:1px dotted #ccc;'>$subject</h2>\r\n";
    $msg .= "<p><strong>Имя: </strong> ".$space."</p>\r\n";
    $msg .= "<p><strong>Телефон: </strong> ".$sources."</p>\r\n";
    $msg .= "<p><strong>Электронная почта: </strong> ".$level."</p>\r\n";
    $msg .= "</body></html>";
 
    // send

    if(@mail($sendto, $subject, $msg, $headers)){
        $_POST['hidden'] = "";
        echo "Отправка завершена";
        
    }

    /*Отправка в телеграм*/
/*setlocale(LC_TIME, 'RUS');
$token = "384831907:AAHpq1umqe3zBOPccdZUhSAeVl-sCkzSzhs";
$chat_id = "-224197596";
$site =  "Cristrage.com";
$arr = array(
  'Заявка с сайта ' => $site,
  'Имя: ' => $name,
  'Телефон: ' => $phone,
  'Mail: ' => $mail,
  'Дата и время: ' => date('l jS \of F Y h:i:s A')
);
foreach($arr as $key => $value) {
  $txt .= "<b>".$key."</b> ".$value."%0A";
};
$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");*/

?>