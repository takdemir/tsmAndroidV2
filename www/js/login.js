/**
 * Created by taner on 28.10.2017.
 */


document.addEventListener("deviceready",onDeviceReadyForAjaxjs,false);

<!--Device Ready Function-->
function onDeviceReadyForAjaxjs(){


    try {
        <!--Initializing Push Notification-->
        let push = PushNotification.init({

            <!--Setting attributes for Android, IOS and Windows-->
            android: {
                senderID: "809436805306",
                icon: 'kos'
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true"
            },
            windows: {}
        });

        <!--This will alert registration ID which is returned by the GCM-->
        push.on('registration', function (data) {
            if(data.registrationId!=='' && data.registrationId!==undefined && data.registrationId!==null){
                common.showToast('Regid kaydı başarılı!','short','bottom',0);
            }else{
                common.showToast('Regid:'+data,'short','bottom',0);
            }
            window.localStorage.setItem("regid", data.registrationId);
        });
        push.on('notification', function (data) {

            if (window.localStorage.getItem("kuryeID") !== "" && window.localStorage.getItem("kuryeID") > 0) {
                mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));

                navigator.notification.alert(
                    data.message,         // message
                    null,                 // callback
                    data.title,           // title
                    'Tamam'                  // buttonName
                );


                let beepsound = common.getpreferencebyname('beepsound');
                let vibratetime = common.getpreferencebyname('vibratetime');
                navigator.notification.beep(beepsound);
                navigator.vibrate(vibratetime);
            }




        });
        push.on('error', function (e) {
            common.showToast('Hata oluştu!'+e.message);
        });
    }catch (e) {
        common.showToast('Catch hatası meydana geldi. Lütfen yazılımcı ile görüşün!'+e.message);
    }


}


let login={

    sessionID: null,
    sessionName: null,
    sessionKuryeId: null,
    getipurl: "https://kuryeotomasyon.com/api",

    getip: function () {

        let companyId=$("#txt-sirketid").val();
        let data={"companyId":companyId};

        if(companyId.trim()!=="" && !isNaN(companyId.trim())) {

            $.ajax({
                url: login.getipurl + "/getcompanyip",
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                beforeSend: function () {
                    //alert("ip alınıyor"+login.getipurl);
                },
                error: function (a, b, c) {
                    alert("Hata:" + c);
                },
                success: function (data) {

                    if (!data.hasError) {
                        window.localStorage.setItem("ipurl", data.data.ip);
                        login.login();
                    } else {
                        alert(data.msg);
                    }
                }

            });
        }else{
            common.showToast('Lütfen geçerli şirket numarası giriniz!');
        }

    },
    login: function () {

        let username=$("#txt-email").val();
        let password=$("#txt-password").val();
        let data={"username":username,"password":password};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/courierlogin",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert(window.localStorage.getItem("ipurl"));
            },
            error: function (a,b,c) {
                common.showToast("Hata:" + a.responseText);
            },
            success: function (data) {

                if(!data.hasError){

                    login.creategcm(data.data.id,data.data.courierHash);

                    login.opensession(data.data.id,data.data.name,data.data.courierHash);

                    //common.showToast(data.msg,'long','center',0);

                }else{
                    common.showToast(data.msg,'long','center',0);
                }
            }

        });
    },
    opensession: function (sessionKuryeId,kuryeName,courierHash) {

        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem("kuryeID",sessionKuryeId);
            window.localStorage.setItem("kuryeName",kuryeName);
            window.localStorage.setItem("courierHash",courierHash);
            if(window.localStorage.getItem("kuryeID")>0 && window.localStorage.getItem("kuryeID")!=="" && window.localStorage.getItem("courierHash")!==""){
                window.location.href="index.html";
            }else{
                common.showToast("Oturum açılamıyor. Lütfen yöneticinize başvurun!");
            }
        } else {

        }

    },

    creategcm: function (courierId,courierHash) {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = courierId;
        let email = "";
        //alert(regid);
        //alert(kuryeID);
        if(regid!=="" && regid!==null && kuryeID!=="" && parseInt(kuryeID)>0) {
            let data = {"regid": regid, "courierId": parseInt(kuryeID), "email": email, "courierHash": courierHash}
            <!--Passing those values to the insertregid.php file-->
            $.ajax({
                url: window.localStorage.getItem("ipurl") + "/setregid",
                type: "POST",
                data: JSON.stringify(data),
                dataType: 'json',
                beforeSend: function () {
                    //alert(regid);
                },
                error: function (a, b, c) {
                    common.showToast("hata:" + a.responseText);
                },
                success: function (data) {
                    //alert(data);
                    if (!data.hasError) {
                        return true;
                    }else{
                        alert(data.msg);
                        window.localStorage.removeItem("kuryeID");
                        window.localStorage.removeItem("kuryeName");
                        window.localStorage.removeItem("ipurl");
                        window.localStorage.removeItem("regid");
                        window.localStorage.removeItem("courierHash");
                        window.location.href="login.html";
                    }
                }
            });
        }else{
            common.showToast('RegID alınamadı! Lütfen yöneticinize başvurun!','long','center',0);
        }

    },
    setlocations: function () {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!=="" && kuryeID>0) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    let pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    let latitude = position.coords.latitude;
                    let longitude = position.coords.longitude;



                    if (latitude !== "" && longitude !== "") {

                        let data = {"regid": regid, "kuryeID": kuryeID, "latitude": latitude, "longitude": longitude,"courierHash": window.localStorage.getItem("courierHash")}
                        <!--Passing those values to the insertregid.php file-->
                        $.ajax({
                            url: window.localStorage.getItem("ipurl") + "/insertposition",
                            type: "POST",
                            data: JSON.stringify(data),
                            dataType: 'json',
                            beforeSend: function () {
                                //alert(regid);
                            },
                            error: function (a, b, c) {
                                alert("hata:" + a.responseText);
                            },
                            success: function (data) {
                                //alert(data);
                                if (!data.hasError) {
                                    return true;
                                }
                            }
                        });

                    }

                }, function () {

                },{enableHighAccuracy: true});
            }

        }





    },
    onError: function () {
        //alert("değişiklik yok");
    }

};


function callLocation() {
    login.setlocation();

}

//login.getip();
//setInterval("callLocation()",60000);