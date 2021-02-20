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
        this.rings = []
    }

    addRing(ring) {
        this.rings.push(ring);
        this.totalArea = this.totalArea + ring.openArea;
        this.totalPinholes = this.totalPinholes + ring.pinholes.length;
        let sieveEquivalentAperture = Math.sqrt(this.totalArea / Math.PI) * 2;
        this.fNumber = FD / sieveEquivalentAperture;
    }
}

class Ring {
    constructor(zone, centerlineRadius){
        this.zone = zone
        this.centerlineRadius = centerlineRadius
        this.openArea = 0
        this.pinholes = []
    } 

    addPinhole(pinhole) {
        this.pinholes.push(pinhole);
        this.openArea = this.openArea + pinhole.pinholeArea;
    }

    // conflict checking function can safely ignore pinholes placed on rings other than current 
    getConflicts(conflictRadius, conflictAzimuth) {
        let conflictArray = [];
        let candidateX = conflictRadius * Math.cos(conflictAzimuth);
        let candidateY = conflictRadius * Math.sin(conflictAzimuth);
    
        // loop through all pinholes on current ring, check if min spacing constraint is violated

        for(let i = 0; i < this.pinholes.length; i ++){
            let conflictDistanceBetweenCenters = distanceBetween(new Point(candidateX, candidateY), this.pinholes[i].point);
            let conflictDistanceBetweenPerimeters = conflictDistanceBetweenCenters - this.pinholes[i].radius - conflictRadius;
            if(conflictDistanceBetweenPerimeters <= SPACE_MIN){
                conflictArray.push(this.pinholes[i]);
            }
        }

        return conflictArray
    }
}

class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
}

class Pinhole {
    constructor(radius, azimuth, parentRingRadius) {
       this.radius = radius
       this.azimuth = azimuth
       this.pinholeArea = Math.PI * radius ** 2
       this.point = new Point(parentRingRadius * Math.cos(azimuth), parentRingRadius * Math.sin(azimuth)); 
    }
}

function distanceBetween(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function randMinMax(min, max) {
    return Math.random() * ((max - min) + min);
 } 
 
//create new pinhole sieve object
const photonSieve = new Sieve(0, 0, 0);

//loop through fresnelZonePlate, add a Ring for each even-numbered zone
for(let i = 1; i < fresnelZonePlate.length; i = i + 2){
    let zoneWidth = fresnelZonePlate[i] - fresnelZonePlate[i-1];
    let centerlineRadius = fresnelZonePlate[i-1] + zoneWidth / 2;
    let ringArea = (Math.PI * fresnelZonePlate[i] ** 2) - (Math.PI * fresnelZonePlate[i-1] ** 2);
    var ring = new Ring(i-1, centerlineRadius, zoneWidth);

    //add pinholes to ring until total area constraint is fulfilled
    while(ring.openArea < AREA_PROP * ringArea){
        let minRadius = Math.max(DIA_MIN, zoneWidth * .25);
        let candidateRadius = randMinMax(minRadius, zoneWidth * MAX_FACTOR);
        let candidateAzimuth = Math.random() * Math.PI * 2 * ring.centerlineRadius;  
        if(ring.getConflicts(candidateRadius, candidateAzimuth).length == 0){
            let pinhole = new Pinhole(candidateRadius, candidateAzimuth, ring.centerlineRadius);         
            ring.addPinhole(pinhole);
        }
    }

    photonSieve.addRing(ring);
}
console.log(JSON.stringify(photonSieve, null, 2));