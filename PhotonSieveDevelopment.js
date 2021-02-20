/* PhotonSieveDevelopment.js
application to design a photon sieve for output as a .dxf file
for fabrication by chemical etching or micro-photolithography
*/

const LAMBDA = 0.0005125;  //light wavelength (mm)
const FD = 72;  //focal distance (mm)
const ZONES = 31;  //number of zones in underlying Fresnel zone plate
const DIA_MIN = 0.003;  //fabrication constraint: minimum pinhole diameter (mm)
const SPACE_MIN = 0.003;  //fabrication constraint: minimum spacing between features (mm)
const MAX_FACTOR = 1.53;  //zone width multiplier for largest pinhole diameter (mm)
const AREA_PROP = 0.400;  //proportion of zone area for sum of pinhole areas

// create underlying Fresnel Zone Plate array
let fresnelZonePlate = [];
for ( let i =0; i < ZONES; i++ ){
    let zone = i+1;
    let radius = Math.sqrt(FD*LAMBDA*zone);
    fresnelZonePlate.push(radius);
}

class Sieve {
    constructor (totalPinholes, totalArea, fNumber) {
        this.totalPinholes = totalPinholes
        this.totalArea = totalArea
        this.fNumber = fNumber
    }
}

class Ring {
    constructor(zone, centerlineRadius, ringWidth, numOfPinholes, openArea){
        this.zone = zone
        this.centerlineRadius = centerlineRadius
        this.ringWidth = ringWidth
        this.numOfPinholes = numOfPinholes
        this.openArea = openArea
    } 
}

/*class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
}*/

class Pinhole {
    constructor(radius, azimuth, pinholeArea) {
       this.radius = radius
       this.azimuth = azimuth
       this.pinholeArea = pinholeArea
       this.pointX = radius * Math.cos(azimuth); 
       this.pointY = radius * Math.sin(azimuth);       
    }
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// conflict checking function can safely ignore pinholes placed on rings other than current 
function getConflicts(conflictRadius, conflictAzimuth) {
    let conflictArray = [];
    let candidateX = conflictRadius * Math.cos(conflictAzimuth);
    let candidateY = conflictRadius * Math.sin(conflictAzimuth);
    
    // loop through all pinholes on current ring, check if min spacing constraint is violated

    for(i = 0; i < currentPinholeArray.length; i ++){
        let conflictDistanceBetweenCenters = distanceBetween(candidateX, currentPinholeArray[i][1], candidateY, currentPinholeArray[i][2]);
        let conflictDistanceBetweenPerimeters = conflictDistanceBetweenCenters - currentPinholeArray[i][0] - conflictRadius;
        if(conflictDistanceBetweenPerimeters <= SPACE_MIN){
            conflictArray.push(i);
        }
    return conflictArray.length
    }
}

function randMinMax(min, max) {
    return Math.random() * ((max - min) + min);
 }

let currentPinholeArray = []; 
 
//create new pinhole sieve object
const photonSieve = new Sieve(0, 0, 0);

//loop through fresnelZonePlate, add a Ring for each even-numbered zone
for(i = 1; i < fresnelZonePlate.length; i = i + 2){
    let zone = i - 1;
    let zoneWidth = fresnelZonePlate[i] - fresnelZonePlate[i-1];
    let centerlineRadius = fresnelZonePlate[i-1] + zoneWidth / 2;
    let ringArea = (Math.PI * fresnelZonePlate[i] ** 2) - (Math.PI * fresnelZonePlate[i-1] ** 2);
    var ring = new Ring(i-1, centerlineRadius, zoneWidth, 0, 0);

    //add pinholes to ring until total area constraint is fulfilled
    while(ring.openArea < AREA_PROP * ringArea){
        let minRadius = Math.max(DIA_MIN, zoneWidth * .25);
        let candidateRadius = randMinMax(minRadius, zoneWidth * MAX_FACTOR);
        let candidateAzimuth = Math.random() * Math.PI * 2;
        if(getConflicts(candidateAzimuth, candidateRadius) = 0){
            let pinhole = new Pinhole(candidateRadius, candidateAzimuth, 0);         
            currentPinholeArray.push([pinhole.radius, pinhole.pointX, pinhole.pointY]);
            pinhole.pinholeArea = Math.PI * radius ** 2;
            ring.openArea = ring.openArea + pinhole.pinholeArea;
            ring.numOfPinholes = ring.numOfPinholes + 1;
            }
        }
    photonSieve.totalArea = photonSieve.totalArea + ring.openArea;
    photonSieve.totalPinholes = photonSieve.totalPinholes + ring.numOfPinholes;
    let sieveEquivalentAperture = Math.sqrt(photonSieve.totalArea / Math.PI) * 2;
    photonSieve.fNumber = FD / sieveEquivalentAperture;
    console.lot(photonSieve);
    }
console.log(photonSieve);