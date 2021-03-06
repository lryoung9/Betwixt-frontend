import React, { Component } from 'react';
import './Map.css';
import GoogleMapReact from 'google-map-react';
import AddressForm from '../AddressForms/AddressForm';
import SecondAddressForm from '../AddressForms/SecondAddressForm';
import google_map from 'google-map-react/lib/google_map';

class SimpleMap extends Component {
  state = {
    zoom: 11,
    // Denver's lat/long
    center: {lat: 39.7392, lng: -104.9903},
    originAddress: "",
    originLatLng: "",
    secondaryAddress: "",
    secondaryLatLng: "",
    isSecondaryAddressVisible: false
  };

  // takes in origin address
  handleOriginAddressChange = ({target: { value}}) => {
    this.setState({originAddress: value})
  };

  // switches rendering of address form to show second address form
  handleShowSecondaryAddress = (event) => {
    event.preventDefault(); 
    this.setState({isSecondaryAddressVisible: true});
  };

  // takes in second address
  handleSecondaryAddressChange = ({target: { value}}) => {
    this.setState({secondaryAddress: value});
  };

  // Finds nearby places
  handlePlacesResults = (results, status) => {
    const map = this.map;
    const infoWindow = this.infoWindow;
    results.map(place => {
      const marker = new window.google.maps.Marker({
        map,
        position: place.geometry.location
      });
      // const request = { placeId: place.place_id };
      // const service = new window.google.maps.places.PlacesService(map);
      // service.getDetails(request, (details, status) => {
        window.google.maps.event.addListener(marker, 'click', () => {
          // console.log("Details:" + JSON.stringify(details))
          infoWindow.setContent(
             `<strong>${place.name}</strong>
             <br>${place.vicinity}
             `);
             infoWindow.open(map, marker);
             console.log(place)
            })
          })
          // });
        };
        
        // <br>${details.formatted_phone_number}
        // <br><a href="${details.url}" target="_blank">${details.formatted_address}</a>
        // <br>Hours: ${details.opening_hours.weekday_text}
  findNearbyPlaces = () => {
    const service = new window.google.maps.places.PlacesService(this.map);
    service.nearbySearch({
      location: this.state.center,
      radius: 1000,
      keyword: ['store']
    }, this.handlePlacesResults)
  };

  getMidpoint = () => {
    const origin = new window.google.maps.LatLng(this.state.originLatLng.lat, this.state.originLatLng.lng);
    const secondary = new window.google.maps.LatLng(this.state.secondaryLatLng.lat, this.state.secondaryLatLng.lng);
    const midpoint = window.google.maps.geometry.spherical.interpolate(
      origin,
      secondary,
      0.5
    );
    this.setState({ ...this.state, zoom: 14, center: {lat: midpoint.lat(), lng: midpoint.lng()}}, this.findNearbyPlaces)
    
  };
  
  getSecondaryLatLng = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({address: this.state.secondaryAddress}, (results, status) => {
      this.setState({
        ...this.state,
        secondaryLatLng: {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        }
      }, this.getMidpoint
    );
    });
  };

  getOriginLatLng = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({address: this.state.originAddress}, (results, status) => {
      console.log(results[0]);
      this.setState({
        ...this.state,
        originLatLng: {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        }
      }, this.getSecondaryLatLng
    );
    });
  };

  // finds mid-point between origin address and second address
  handleFindBetwixt = (event) => {
    event.preventDefault();
    this.getOriginLatLng();
  };

  assignInstanceVariables = ({map, maps}) => {
    this.map = map;
    this.infoWindow = new window.google.maps.InfoWindow();
  };
 
  render() {
    return (
      <div className="map">
        <GoogleMapReact
        bootstrapURLKeys={{
          key: "AIzaSyAXg5oqr-oT6WGZ0JHEIJUH3EqNGKP2XoA",
          libraries: "geometry,places"
        }}
        center={this.state.center}
        zoom={this.state.zoom}
        onGoogleApiLoaded={this.assignInstanceVariables}
        yesIWantToUseGoogleMapApiInternals
        >
        {this.state.isSecondaryAddressVisible ? <SecondAddressForm
            handleSecondaryAddressChange={this.handleSecondaryAddressChange}
            handleFindBetwixt={this.handleFindBetwixt}
          />: (
          <AddressForm
            handleOriginAddressChange={this.handleOriginAddressChange}
            handleShowSecondaryAddress={this.handleShowSecondaryAddress}
          />
        )}
        </GoogleMapReact>
      </div>
    );
  }
}

export default SimpleMap;