/**
 * Created by taner on 02.06.2018.
 */

$(document).ready(function () {

    $('#myTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show')
    })

});



document.addEventListener("deviceready",onDeviceReadyForMyPanel,false);



<!--Device Ready Function-->
function onDeviceReadyForMyPanel(){

    window.localStorage.setItem("regid", '');
    <!--Initializing Push Notification-->
    let push = PushNotification.init({

        <!--Setting attributes for Android, IOS and Windows-->
        android: {
            senderID: "809436805306"
        },
        ios: {
            alert: "true",
            badge: "true",
            sound: "true"
        },
        windows: {}
    });

    <!--This will alert registration ID which is returned by the GCM-->
    push.on('registration', function(data) {
        window.localStorage.setItem("regid",data.registrationId);
    });
    push.on('notification', function(data) {

        if(window.localStorage.getItem("kuryeID")!=="" && window.localStorage.getItem("kuryeID")>0) {
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
    push.on('error', function(e) {
        alert(e.message);
    });





    let callbackFn = function (location) {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = window.localStorage.getItem("kuryeID");
        let latitude = location.latitude;
        let longitude = location.longitude;
        let courierHash = window.localStorage.getItem("courierHash");

        if (latitude !== "" && longitude !== "") {

            let data = {"regid": regid, "tsmCourierId": kuryeID, "latitude": latitude, "longitude": longitude,"courierHash": courierHash}
            <!--Passing those values to the insertregid.php file-->
            $.ajax({
                url: window.localStorage.getItem("ipurl") + "/setcourierposition",
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

        }else{

            let regid = window.localStorage.getItem("regid");
            let kuryeID = window.localStorage.getItem("kuryeID");
            let courierHash = window.localStorage.getItem("courierHash");

            let data = {"regid": regid, "courierId": kuryeID, "courierHash": courierHash};
            <!--Passing those values to the insertregid.php file-->
            $.ajax({
                url: window.localStorage.getItem("ipurl") + "/checkcouriernavigationstatus",
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

        backgroundGeolocation.finish();

    };

    let failureFn = function (error) {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = window.localStorage.getItem("kuryeID");
        let courierHash = window.localStorage.getItem("courierHash");

        let data = {"regid": regid, "courierId": kuryeID, "courierHash": courierHash};
        <!--Passing those values to the insertregid.php file-->
        $.ajax({
            url: window.localStorage.getItem("ipurl") + "/checkcouriernavigationstatus",
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
    };

    backgroundGeolocation.configure(callbackFn, failureFn, {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        url: window.localStorage.getItem("ipurl")+'/insertbackgroundposition',
        syncUrl: window.localStorage.getItem("ipurl")+'/insertbackgroundposition',
        httpHeaders: { 'X-FOO': 'bar' },
        postTemplate: {
            lat: '@latitude',
            lon: '@longitude',
            tsmCourierId: window.localStorage.getItem("kuryeID"), // you can also add your own properties
            courierId: window.localStorage.getItem("kuryeID") // you can also add your own properties
        },
        maxLocations: 10000,
        // Android only section
        locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
        interval: 40000,
        stopOnTerminate: true,
        startOnBoot: true,
        startForeground: false,
        fastestInterval: 50000,
        activitiesInterval: 10000,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        notificationIconColor: '#FEDD1E',
        notificationIconLarge: 'mappointer_large',
        notificationIconSmall: 'mappointer_small',
        debug: false
    });



    backgroundGeolocation.start();



}




let mypanel={

    checklogin: function () {

        if(window.localStorage.getItem("kuryeID")==="" || window.localStorage.getItem("kuryeID")===null){
           window.location.href="login.html";
        }
    },
    notificationAlert: function(message,title,sound){

        if(window.localStorage.getItem("kuryeID")!=="" && window.localStorage.getItem("kuryeID")>0) {
            this.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
            this.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
        }
        let beepsound = common.getpreferencebyname('beepsound');
        let vibratetime = common.getpreferencebyname('vibratetime');
        navigator.notification.alert(
            message,         // message
            null,                 // callback
            title,           // title
            'Tamam'                  // buttonName
        );

        if(sound) {
            navigator.notification.beep(beepsound);
            navigator.vibrate(vibratetime);
        }

    },
    logout: function () {
        window.localStorage.removeItem("kuryeID");
        window.localStorage.removeItem("kuryeName");
        window.localStorage.removeItem("ipurl");
        window.localStorage.removeItem("regid");
        window.localStorage.removeItem("courierHash");
        window.localStorage.removeItem("vibratetime");
        window.location.href="login.html";
    },
    getjobsOnkurye: function (kuryeID) {

        let data={"courierId":kuryeID,"courierHash": window.localStorage.getItem("courierHash")};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/getcourierworkonsforandroid",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a,b,c) {
                //alert("Hata: getonjobkurye" + a.responseText);
            },
            success: function (data) {


                    if(data.data!==""){

                        let table="";



                        let i = 1;
                        let y = 0;
                        $.each(data.data, function (k,v) {

                            let accordionOpen="";
                            if(i===1){
                               accordionOpen="";
                            }

                            let headId="heading"+i;
                            let collapseId="collapse"+i;

                            let pickupCustomerName = "";
                            let pickupCustomerDistrict = "";
                            let pickupCustomerAddress = "";
                            let pickupCustomerPhone = "";
                            let pickupCustomerNote = "";

                            if(v.tsmf2===null || v.tsmf2==='' || v.isF2Fake){
                                pickupCustomerName= v.tsmf1.name;
                                pickupCustomerDistrict = v.tsmf1.tsmdistrict.districtName;
                                pickupCustomerAddress = v.tsmf1.address;
                                pickupCustomerPhone = v.tsmf1.mobilePhone;
                                pickupCustomerNote = v.tsmf1.note;
                            }else{
                                pickupCustomerName= v.tsmf2.name;
                                pickupCustomerDistrict = v.tsmf2.tsmdistrict.districtName;
                                pickupCustomerAddress = v.tsmf2.address;
                                pickupCustomerPhone = v.tsmf2.mobilePhone;
                                pickupCustomerNote = v.tsmf2.note;
                            }

                            let paymentStatusOriginal = v.tsmcustomerinvoices.paymentStatus;
                            let paymentStatus = 'Ödendi';
                            if(paymentStatusOriginal==='Unpaid'){
                                paymentStatus = 'Ödenmedi';
                            }

                            let deliverToCourierTimeOriginal = v.deliverToCourierTime;
                            let deliverToCourierTime = "";
                            let explodeTime = deliverToCourierTimeOriginal.split(' ');
                            deliverToCourierTime = explodeTime[1];

                            let officialName = "-";

                            if(v.tsmf3.tsmadminofficials !== null && v.tsmf3.tsmadminofficials!=="" && v.tsmf3.tsmadminofficials!=="undefined"){
                                $.each(v.tsmf3.tsmadminofficials, function (kk,vv) {

                                    officialName += vv.name+'-->'+vv.mobilePhone+'<br>';

                                });

                            }

                            let color = "panel-default";
                                if(v.pickupDate!=="" && v.pickupDate!==null){color = "panel-warning";}
                                table+='<div class="panel '+color+'" style="padding: 0; margin: 0;">'+


                                '<div class="panel-heading" role="tab" id="'+headId+'">'+
                                '<h4 class="panel-title">'+
                                '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#'+collapseId+'" aria-expanded="true" aria-controls="'+collapseId+'">'+
                                i+'.Gönderi ('+pickupCustomerDistrict+' - '+v.tsmf3.tsmdistrict.districtName+')'+
                                '</a>'+
                                '</h4>'+
                                '</div>'+
                                '<div id="'+collapseId+'" class="panel-collapse collapse '+accordionOpen+'" role="tabpanel" aria-labelledby="'+headId+'">'+
                                '<div class="panel-body" style="padding: 0 0 0 0; margin: 0 0 0 0;">'+

                                '<div class="panel panel-primary" style="padding: 0 0 10px 0; margin: 0 0 10px 0;"><div class="panel-heading">ALINACAK</div><div class="panel-body" style="padding: 0 0 0 0; margin: 0 0 0 0;">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Gönderi Nu.:</th>'+'<td>'+v.id+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Kişi</th>'+'<td>'+pickupCustomerName+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Semt</th>'+'<td>'+pickupCustomerDistrict+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Adres</th>'+'<td>'+pickupCustomerAddress+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Tel:</th>'+'<td>'+pickupCustomerPhone+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Not1</th>'+'<td>'+pickupCustomerNote+'</td>'+'</tr>'+
                                    '</table>'+
                                 '</div></div>'+
                                 '<div class="panel panel-primary" style="padding: 0 0 10px 0; margin: 0 0 10px 0;"><div class="panel-heading">TESLİM EDİLECEK</div><div class="panel-body" style="padding: 0 0 0 0; margin: 0 0 0 0;">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Teslim Ed.Kisi</th>'+'<td>'+v.tsmf3.name+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Teslim Ed.Semt</th>'+'<td>'+v.tsmf3.tsmdistrict.districtName+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Teslim Ed.Adres</th>'+'<td>'+v.tsmf3.address+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Tel:</th>'+'<td>'+v.tsmf3.phone+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Not3</th>'+'<td>'+v.tsmf3.note+'</td>'+'</tr>'+
                                    '</table>'+
                                 '</div></div>'+
                                 '<div class="panel panel-primary" style="padding: 0 0 10px 0; margin: 0 0 10px 0;"><div class="panel-heading">DİĞER BİLGİLER</div><div class="panel-body" style="padding: 0 0 0 0; margin: 0 0 0 0;">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Tutar</th>'+'<td>'+v.tsmcustomerinvoices.total+' TL</td>'+'</tr>'+
                                        '<tr>'+'<th>İşlem Tipi</th>'+'<td>'+v.tsmdeliveryType.name+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Ödeme Tipi</th>'+'<td>'+v.tsmpaymentType.paymentType+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Ödeme Durumu</th>'+'<td>'+paymentStatus+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Okuma Saati</th>'+'<td>'+deliverToCourierTime+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Teslimat Yetkili(ler)</th>'+'<td>'+officialName+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Kayıt Veren (F1):</th>'+'<td>'+v.tsmf1.name+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Kayıt Veren Tel:</th>'+'<td>'+v.tsmf1.mobilePhone+'</td>'+'</tr>';
                                        /*'<tr>'+'<th>F2 Tel.:</th>'+'<td>'+v.f2cep+'</td>'+'</tr>'+*/

                                        if(v.willBringBack===1 && (v.isBackTaken===0 || v.backDeliveredPerson==='')){

                                            table +='<tr>'+'<td></td>'+'<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'pickup\','+(i-1)+')" class="btn btn-warning" value="Alındı" /> </td>'+'</tr>'+
                                                    '<tr>'+'<td>' +
                                                    '<input type="text" placeholder="İlk Gön. Tes.Ed.Kişi" name="deliveredName" class="form-control" />' +
                                                    '<input type="text" placeholder="İlk Gön. Tes.Ed.Şirket" name="deliveredCompany" class="form-control" />' +
                                                    '<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'backorderdelivered\','+(i-1)+')" class="btn btn-success" value="Teslim" /> </td>'+
                                                    '</tr>';

                                        }else if(v.willBringBack===1 && (v.isBackTaken===1 || v.backDeliveredPerson==='')){

                                            table +='<tr>'+'<td></td>'+'<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'pickup\','+(i-1)+')" class="btn btn-warning" value="Alındı" /> </td>'+'</tr>'+
                                                '<tr>'+'<td>' +
                                                '<input type="text" placeholder="Teslim Ed.Kişi" name="deliveredName" class="form-control" />' +
                                                '<input type="text" placeholder="Teslim Ed.Şirket" name="deliveredCompany" class="form-control" />' +
                                                '<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'delivered\','+(i-1)+')" class="btn btn-success" value="Teslim" /> </td>'+
                                                '</tr>';

                                        }else{

                                            table +='<tr>'+'<td></td>'+'<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'pickup\','+(i-1)+')" class="btn btn-warning" value="Alındı" /> </td>'+'</tr>'+
                                                    '<tr>'+'<td>' +
                                                    '<input type="text" placeholder="Teslim Ed.Kişi" name="deliveredName" class="form-control" />' +
                                                    '<input type="text" placeholder="Teslim Ed.Şirket" name="deliveredCompany" class="form-control" /> </td>'+
                                                    '<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'delivered\','+(i-1)+')" class="btn btn-success" value="Teslim" /> </td>'+
                                                    '</tr>';

                                        }


                                table +='</table>'+
                                    '</div></div>'+


                                '</div>'+
                                '</div>'+
                                '</div>';



                            i++;
                            y++;

                        });


                        $("#accordion").html("").html(table);

                        $("#uzerimdekiisCount").html(y);

                    }else{
                        $("#accordion").html("Üzerinizde iş bulunmamaktadır!");
                        $("#uzerimdekiisCount").html(0);
                    }

            }

        });
    },
    getdeliveredjobsOnkurye: function (kuryeID) {

        let data={"courierId":kuryeID,"courierHash": window.localStorage.getItem("courierHash")};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/getcourierdeliveredworksforandroid",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a,b,c) {
                //alert("Hata: getdeliveredjob" + a.responseText);
            },
            success: function (data) {

//console.log(data);

                if(data.data!==""){

                    let table="";



                    let i = 1;
                    let y = 0;
                    $.each(data.data, function (k,v) {

                        let accordionOpen="";
                        if(i===1){
                            accordionOpen="";
                        }

                        let headId="heading"+(i+100);
                        let collapseId="collapse"+(i+100);


                        let pickupCustomerName = "";
                        let pickupCustomerDistrict = "";
                        let pickupCustomerAddress = "";
                        let pickupCustomerPhone = "";
                        let pickupCustomerNote = "";

                        if(v.tsmf2===null || v.tsmf2==='' || v.isF2Fake){
                            pickupCustomerName= v.tsmf1.name;
                            pickupCustomerDistrict = v.tsmf1.tsmdistrict.districtName;
                            pickupCustomerAddress = v.tsmf1.address;
                            pickupCustomerPhone = v.tsmf1.mobilePhone;
                            pickupCustomerNote = v.tsmf1.note;
                        }else{
                            pickupCustomerName= v.tsmf2.name;
                            pickupCustomerDistrict = v.tsmf2.tsmdistrict.districtName;
                            pickupCustomerAddress = v.tsmf2.address;
                            pickupCustomerPhone = v.tsmf2.mobilePhone;
                            pickupCustomerNote = v.tsmf2.note;
                        }

                        let paymentStatusOriginal = v.tsmcustomerinvoices.paymentStatus;
                        let paymentStatus = 'Ödendi';
                        if(paymentStatusOriginal==='Unpaid'){
                            paymentStatus = 'Ödenmedi';
                        }

                        let deliverToCourierTimeOriginal = v.deliverToCourierTime;
                        let deliverToCourierTime = "";
                        let explodeTime = deliverToCourierTimeOriginal.split(' ');
                        deliverToCourierTime = explodeTime[1];


                        let pickedupTimeOriginal = v.pickupDate;
                        let pickedUpTime = "";
                        let explodePickedupTime = pickedupTimeOriginal.split(' ');
                        pickedUpTime = explodePickedupTime[1];

                        let deliveredTimeOriginal = v.deliveredDate;
                        let deliveredTime = "";
                        let explodeDeliveredTime = deliveredTimeOriginal.split(' ');
                        deliveredTime = explodeDeliveredTime[1];


                        let officialName = "-";

                        if(v.tsmf3.tsmadminofficials !== null && v.tsmf3.tsmadminofficials!=="" && v.tsmf3.tsmadminofficials!=="undefined"){
                            $.each(v.tsmf3.tsmadminofficials, function (kk,vv) {

                                officialName += vv.name+'-->'+vv.mobilePhone+'<br>';

                            });

                        }

                        let deliveredPhone = "-";
                        if(v.tsmf3.mobilePhone!=="" && v.tsmf3.mobilePhone!==null){
                            deliveredPhone = v.tsmf3.mobilePhone;
                        }



                        table+='<div class="panel panel-default">'+


                            '<div class="panel-heading" role="tab" id="'+headId+'">'+
                            '<h4 class="panel-title">'+
                            '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#'+collapseId+'" aria-expanded="true" aria-controls="'+collapseId+'">'+
                            i+'.Teslimat'+
                            '</a>'+
                            '</h4>'+
                            '</div>'+
                            '<div id="'+collapseId+'" class="panel-collapse collapse '+accordionOpen+'" role="tabpanel" aria-labelledby="'+headId+'">'+
                            '<div class="panel-body" style="padding: 0 0 0 0; margin: 0 0 0 0;">'+


                            '<table class="table table-bordered">'+
                            '<tr>'+'<th>Gönderi Nu.:</th>'+'<td>'+v.id+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Kişi</th>'+'<td>'+pickupCustomerName+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Semt</th>'+'<td>'+pickupCustomerDistrict+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Adres</th>'+'<td>'+pickupCustomerAddress+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Kisi</th>'+'<td>'+v.tsmf3.name+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Semt</th>'+'<td>'+v.tsmf3.tsmdistrict.districtName+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Adres</th>'+'<td>'+v.tsmf3.address+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tutar</th>'+'<td>'+v.tsmcustomerinvoices.total+' TL</td>'+'</tr>'+
                            '<tr>'+'<th>İşlem Tipi</th>'+'<td>'+v.tsmdeliveryType.name+'</td>'+'</tr>'+
                            '<tr>'+'<th>Ödeme</th>'+'<td>'+paymentStatus+'</td>'+'</tr>'+
                            '<tr>'+'<th>Ok.Saati</th>'+'<td>'+deliverToCourierTime+'</td>'+'</tr>'+
                            '<tr>'+'<th>Alım Saati</th>'+'<td>'+pickedUpTime+'</td>'+'</tr>'+
                            '<tr>'+'<th>Teslim Saati</th>'+'<td>'+deliveredTime+'</td>'+'</tr>'+
                            '<tr>'+'<th>Teslim Alan</th>'+'<td>'+v.deliveredPerson+' '+v.deliveredCompany+'</td>'+'</tr>'+
                            '<tr>'+'<th>Yetkili(ler)</th>'+'<td>'+officialName+'</td>'+'</tr>'+
                            '<tr>'+'<th>Kayıt Veren (F1):</th>'+'<td>'+v.tsmf1.name+'</td>'+'</tr>'+
                            '<tr>'+'<th>Kayıt Veren Tel.:</th>'+'<td>'+v.tsmf1.mobilePhone+'</td>'+'</tr>'+
                            '<tr>'+'<th>F2 Tel.:</th>'+'<td>'+pickupCustomerPhone+'</td>'+'</tr>'+
                            '<tr>'+'<th>F3 Tel.:</th>'+'<td>'+deliveredPhone+'</td>'+'</tr>'+
                            '<tr>'+'<th>İşlemi Geri al</th>'+
                            '<td><input type="button" onclick="mypanel.getjobback('+v.id+')" value="Geri al" class="btn btn-danger" /></td>'+
                            '</tr>'+
                            '</table>'+


                            '</div>'+
                            '</div>'+
                            '</div>';

                        i++;
                        y++;

                    });


                    $("#accordion2").html("").html(table);

                    $("#teslimedilenisCount").html(y);

                }else{
                    $("#accordion2").html("Teslim Edilen iş bulunmamaktadır!");
                    $("#teslimedilenisCount").html(0);
                }

            }

        });
    },
    executeonjob: function (jobID,executetype,eq) {
        let courierId = window.localStorage.getItem("kuryeID");
        let courierName = window.localStorage.getItem("kuryeName");
        let courierHash = window.localStorage.getItem("courierHash");
        if(executetype==='pickup') {

            let data = {"tsmOrderId": jobID,"courierId":window.localStorage.getItem("kuryeID"),"courierHash": courierHash};

            $.ajax({
                url: window.localStorage.getItem("ipurl") + "/setpickedupforandroid",
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                beforeSend: function () {
                    //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
                },
                error: function (a, b, c) {
                    alert("Hata: executejob" + a.responseText);
                },
                success: function (data) {

                    if(!data.hasError){

                        mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                        mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                        let msg = "";
                        if(data.msg!==''){
                            msg = data.msg;
                        }
                        //alert(jobID+'|'+host+'|'+courierName+'|'+courierId+'|'+courierHash);

                        socket.emit('setPickedUp',{'message':courierName+' isimli kurye <a href="/operation">' + jobID + '</a> numaralı siparişi teslim aldı!','orderId':jobID,'courierId':courierId,'courierHash':courierHash,'process':'setPickedUp','host':host});

                        alert("Alındı bildirisi merkeze kaydedildi!"+msg);

                    }else{
                        let msg = "";
                        if(data.msg!==''){
                            msg = data.msg;
                        }
                        alert("Alındı bildirilirken bir hata oluştu!"+msg);
                    }

                }

            });

        }else if(executetype==='backorderdelivered') {

            let deliveredName = $('input[name="deliveredName"]:eq(' + eq + ')').val();
            let deliveredCompanyName = $('input[name="deliveredCompany"]:eq(' + eq + ')').val();

            let data = {"tsmOrderId": jobID,"deliveredName":deliveredName,"deliveredCompanyName":deliveredCompanyName};

            if(deliveredName!=='' && deliveredName!==null) {

                $.ajax({
                    url: window.localStorage.getItem("ipurl") + "/setbackworkdeliverednameforandroid",
                    type: "POST",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function () {
                        //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
                    },
                    error: function (a, b, c) {
                        //alert("Hata: executejob" + a.responseText);
                    },
                    success: function (data) {

                        if (!data.hasError) {

                            mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            socket.emit('backorderdelivered',{'message':courierName+' isimli kurye <a href="/operation">' + jobID + '</a> numaralı siparişi teslim etti!','orderId':jobID,'courierId':courierId,'courierHash':courierHash,'process':'setPickedUp','host':host});
                            alert("Teslim bildirisi merkeze kaydedildi!");

                        } else {
                            alert("Teslim bildirilirken bir hata oluştu!");
                        }

                    }

                });
            }else{
                alert('İlk Teslimatın yapıldığı ismi boş bırakmayınız!');
            }

        }else{

            let deliveredName=$("input[name='deliveredName']:eq(" + eq + ")").val();
            let deliveredCompanyName=$("input[name='deliveredCompanyName']:eq(" + eq + ")").val();
            if(deliveredName!=="") {
                let data = {
                    "tsmOrderId": jobID,
                    "deliveredName": deliveredName,
                    "deliveredCompanyName": deliveredCompanyName
                };

                $.ajax({
                    url: window.localStorage.getItem("ipurl") + "/setorderdeliveredforandroid",
                    type: "POST",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function () {
                        //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" islem:"+jobID);
                    },
                    error: function (a, b, c) {
                        //alert("Hata:" + a.responseText);
                    },
                    success: function (data) {

                        if (!data.hasError) {

                            mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            socket.emit('setorderDelivered',{'message':courierName+' isimli kurye <a href="/operation">' + jobID + '</a> numaralı siparişi teslim etti!','orderId':jobID,'courierId':courierId,'courierHash':courierHash,'process':'setPickedUp','host':host});
                            alert("İşlem teslim edildi!");

                        } else {
                            alert("Teslim edilirken bir hata oluştu!"+data.msg);
                        }
                    }

                });

            }else{
                alert("Teslim edilen kişiyi giriniz!");
            }

        }
        
    },
    getjobback: function (jobID) {
        let courierId = window.localStorage.getItem("kuryeID");
        let courierName = window.localStorage.getItem("kuryeName");
        let data = {
            "tsmOrderId": jobID,"courierId":courierId,"courierHash": window.localStorage.getItem("courierHash")
        };

        $.ajax({
            url: window.localStorage.getItem("ipurl") + "/getbackfromdeliveredforandroid",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a, b, c) {
                //alert("Hata: jobback" + a.responseText);
            },
            success: function (data) {

                if (!data.hasError) {

                    mypanel.getjobsOnkurye(courierId);
                    mypanel.getdeliveredjobsOnkurye(courierId);
                    socket.emit('courierNotifier',{'message':courierName+' isimli kurye <a href="/operation">' + jobID + '</a> numaralı siparişi teslim edildiden, kurye üzerindeye geri aldı!','orderId':jobID,'courierId':courierId,'process':'courierNotifiergetbackfromdelivered','host':host});
                    alert("Teslimat geri alındı!");

                } else {
                    alert("İşlem geri alınırken bir hata oluştu!");
                }
            }

        });

    },
    getteslimsaati: function (eq) {

        let date=new Date();
        let day=date.getDate();
        let month=date.getMonth()+1;
        if(month<10){
            month="0"+month;
        }
        let year=date.getFullYear();
        let hour=date.getHours();
        if(hour<10){
            hour="0"+hour;
        }
        let minute=date.getMinutes();
        if(minute<10){
            minute="0"+minute;
        }
        let second=date.getSeconds();
        if(second<10){
            second="0"+second;
        }
        let teslimSaati=day+"-"+month+"-"+year+" "+hour+":"+minute+":"+second;
        $("input[name='teslimSaati']:eq("+eq+")").val(teslimSaati);
    },
    setlocations: function () {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!=="" && kuryeID>0) {

                navigator.geolocation.getCurrentPosition(function (position) {
                    let pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    let latitude = position.coords.latitude;
                    let longitude = position.coords.longitude;



                    if (latitude !=="" && longitude !== "") {

                        let data = {"regid": regid, "tsmCourierId": kuryeID, "latitude": latitude, "longitude": longitude, "courierId":kuryeID, "courierHash": window.localStorage.getItem("courierHash")}
                        <!--Passing those values to the insertregid.php file-->
                        $.ajax({
                            url: window.localStorage.getItem("ipurl") + "/setcourierposition",
                            type: "POST",
                            data: JSON.stringify(data),
                            dataType: 'json',
                            beforeSend: function () {
                                //alert(regid);
                            },
                            error: function (a, b, c) {
                                //alert("hata:" + a.responseText);
                            },
                            success: function (data) {
                                //alert(data);
                                if (!data.hasError) {
                                    return true;
                                }
                            }
                        });

                    }

                }, function (error) {

                    if(error.PERMISSION_DENIED){
                        common.showToast('Navigasyonunuza izin veriniz!','short','bottom',0);
                    }else if(error.POSITION_UNAVAILABLE){
                        common.showToast('Navigasyonunuz açık değil!','short','bottom',0);
                    }else if(error.TIMEOUT){
                        common.showToast('Navigasyonunuz üzerinden yerinize ulaşamıyorum!','short','bottom',0);
                    }


                },{enableHighAccuracy: true, timeout: 5000});


        }





    },
    setlocationswithwatch: function () {

        let regid = window.localStorage.getItem("regid");
        let kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!=="" && kuryeID>0) {

            navigator.geolocation.watchPosition(function (position) {
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;



                if (latitude !== "" && longitude !== "") {

                    let data = {"regid": regid, "tsmCourierId": kuryeID, "latitude": latitude, "longitude": longitude, "courierId":kuryeID, "courierHash": window.localStorage.getItem("courierHash")}
                    <!--Passing those values to the insertregid.php file-->
                    $.ajax({
                        url: window.localStorage.getItem("ipurl") + "/setcourierposition",
                        type: "POST",
                        data: JSON.stringify(data),
                        dataType: 'json',
                        beforeSend: function () {
                            //alert(regid);
                        },
                        error: function (a, b, c) {
                            //alert("hata:" + a.responseText);
                        },
                        success: function (data) {
                            //alert(data);
                            if (!data.hasError) {
                                return true;
                            }
                        }
                    });

                }

            }, function (error) {

                if(error.PERMISSION_DENIED){
                    common.showToast('Navigasyonunuza izin veriniz!','short','bottom',0);
                }else if(error.POSITION_UNAVAILABLE){
                    common.showToast('Navigasyonunuz açık değil!','short','bottom',0);
                }else if(error.TIMEOUT){
                    common.showToast('Navigasyonunuz üzerinden yerinize ulaşamıyorum!','short','bottom',0);
                }


            },{enableHighAccuracy: true, timeout: 5000});


        }





    }
};




mypanel.checklogin();
mypanel.setlocations();
mypanel.setlocationswithwatch();

document.addEventListener("pause", onPause, false);
function onPause() {
    setInterval(function(){


        backgroundGeolocation.isLocationEnabled(function (enabled) {

            backgroundGeolocation.getLocations(function (locations) {
                //backgroundGeolocation.showLocationSettings();

                let a= "1";
                locations.forEach(function (loc) {
                    //if ((now - loc.time) <= sameDayDiffInMillis) {

                    //}
                    a +="2";
                });
                let now = Date.now();
                let sameDayDiffInMillis = 24 * 900 * 1000;
                //common.showToast(a,'long','center',0);
                let regid = window.localStorage.getItem("regid");
                let kuryeID = window.localStorage.getItem("kuryeID");
                let latitude = "-122.084";
                let longitude = "37.889900";



                if (latitude !== "" && longitude !== "") {

                    let data = {"regid": regid, "tsmCourierId": kuryeID, "latitude": latitude, "longitude": longitude,"locations":locations}
                    <!--Passing those values to the insertregid.php file-->
                    /*$.ajax({
                        url: window.localStorage.getItem("ipurl") + "/setcourierposition",
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
                    });*/

                }

            });

        }, function () {
            backgroundGeolocation.showLocationSettings();
        });


    },5000);
    window.plugins.insomnia.keepAwake();

}



if(window.localStorage.getItem("kuryeID")!=="" && window.localStorage.getItem("kuryeID")>0) {
    mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
    mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));

}


