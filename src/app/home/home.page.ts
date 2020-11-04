import { Component, OnInit } from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import '@capacitor-community/camera-preview'
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { filter } from 'rxjs/operators';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';

declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: any;
  subscriptionGeolocation: any;
  subscriptionOrientation: any;
  subscriptionAcceleration: any;
  directions: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  currentLocation: Geoposition;
  currentMarker: any;

  cameraActive=false;


  pois = [{
    latitude: -2.213728,//41.656803,
    longitude: -79.919136,//-0.878283,
    distance: null,
    bearing: null,
    name: 'Basílica del Pilar',
    isVisible: false,
    traslate: null,
    marker: null,
    subtitle: 'Monumento Histórico'
  },
  {
    latitude: -2.213739,//41.683640,
    longitude: -79.919132,//-0.887370,
    distance: null,
    bearing: null,
    name: 'EINA',
    isVisible: false,
    traslate: null,
    marker: null,
    subtitle: 'Antiguo CPS'

  },
  {
    latitude: -2.213703,//41.670448,
    longitude: -79.919120,//-0.890001,
    distance: null,
    bearing: null,
    name: 'Gran Casa',
    isVisible: false,
    traslate: null,
    marker: null,
    subtitle: 'Centro Comercial'
  }]

  constructor(private geolocation: Geolocation, public deviceMotion: DeviceMotion, public deviceOrientation: DeviceOrientation) {}

  openCamera() {

    const cameraPreviewOptions: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      position: 'rear',
      toBack: true,
      className:'cameraPreview',
      parent:'cameraPreview'
      };

    CameraPreview.start(cameraPreviewOptions);
      this.cameraActive=true;
  }

  ionViewWillLeave() {
    
   // this.cameraPreview.stopCamera();
   CameraPreview.stop();
    this.subscriptionGeolocation.unsubscribe();
    this.subscriptionOrientation.unsubscribe();
    this.subscriptionAcceleration.unsubscribe();
  }
  
  getOrientation(): void {
    // Watch the device compass heading change
    this.subscriptionOrientation = this.deviceOrientation.watchHeading({ frequency: 50 }).subscribe(
      (data: DeviceOrientationCompassHeading) => {
        //let direction: string = this.directions[Math.abs((data.trueHeading / 45) + 1)];
        this.pois.forEach(poi => {
          this.showVisiblePois(data.trueHeading, poi);
        })
      }
    );
  }

  showVisiblePois(degree: number, poi): void {
    if (Math.abs(poi.bearing - degree) <= 20) {
      poi.isVisible = true;
      let traslate: number = ((poi.bearing - degree) * 5) + 20;
      poi.traslate = traslate.toFixed(0);
    } else {
      poi.isVisible = false;
    }
  }

  getPosition(){
    this.geolocation.getCurrentPosition().then(response => {
      this.loadMap(response);
    })

    this.subscriptionGeolocation = this.geolocation.watchPosition()
    .pipe(filter((p: any) => p.coords !== undefined)) //Filter Out Errors
      .subscribe((position) => {
        this.currentLocation = position;
        this.pois.forEach(poi => {
          poi.distance = this.distanceBetween(poi, position.coords);
          poi.bearing = this.bearingBetween(poi, position.coords);
        })
      });
  }

  loadMap(position: Geoposition): void {
    // create a new map by passing HTMLElement
    let mapEle: HTMLElement = document.getElementById('cameraPreview');
    // create LatLng object
    let myLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
    // create map
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 16,
      disableDefaultUI: true
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.paintPois();
    });
  }

  paintPois(): void {
    this.currentMarker = new google.maps.Marker({
      position: { lat: this.currentLocation.coords.latitude, lng: this.currentLocation.coords.longitude },
      map: this.map,
      animation: google.maps.Animation.DROP,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    this.pois.forEach(poi => {
      var infowindow = new google.maps.InfoWindow({
        content: '<p>' + poi.name + '</p>'
      });
      poi.marker = new google.maps.Marker({
        position: { lat: poi.latitude, lng: poi.longitude },
        map: this.map,
        title: poi.name,
        icon: 'assets/img/pointerWine.png'
      });
      poi.marker.addListener('click', function () {
        infowindow.open(this.map, poi.marker);
      });
    })
  }

  rad(x): number {
    return x * Math.PI / 180;
  };

  distanceBetween(p1, p2): string {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2.latitude - p1.latitude);
    var dLong = this.rad(p2.longitude - p1.longitude);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.latitude)) * Math.cos(this.rad(p2.latitude)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = (R * c) / 1000;
    return d.toFixed(2); // returns the distance in kilometers
  }

  bearingBetween(p1, p2): number {
    var dLat = this.rad(p2.latitude - p1.latitude);
    var dLong = this.rad(p2.longitude - p1.longitude);
    let lat1: number = this.rad(p1.latitude);
    let lat2: number = this.rad(p2.latitude);
    let y: number = Math.sin(dLong) * Math.cos(lat2);
    let x: number = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLong);
    let bearing: number = Math.atan2(y, x) * 180 / Math.PI;
    bearing = bearing + 180;
    return bearing; // returns angle in grades from North
  }

  ngOnInit(){
    this.openCamera();
  }
}
