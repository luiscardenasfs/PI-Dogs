const axios = require('axios');
const { Router } = require("express");
const {Dog, Temperament} = require('../db');
const temperamentsRoute = Router();


// [ ] GET /temperaments:
// Obtener todos los temperamentos posibles
// En una primera instancia deberán obtenerlos desde la API externa y guardarlos en su propia base de datos y luego ya utilizarlos desde allí

temperamentsRoute.get('', async(req,res)=>{

try{
const getApiDog = await axios.get('https://api.thedogapi.com/v1/breeds?api_key=live_TORQ3Q7OL9qFFyfIlogWfCdXJKWtyk0mjuBCavTKGIad8rTG2FPwAzjFVfBosSV5');

const temperament = getApiDog.data.map(mapeo => mapeo.temperament).join(", ").split(", ") // une en un array y luego lo separa en comita 
//[{temp:'a,b,c,d'}] ----> ['a,b,c,d','e,f,a,c'] ----> 'a,b,c,d,e,f,a,c' ---> el split => ['a','b', 'c', 'd']  

console.log(temperament)
temperament.map(temperamentMap=> {
    Temperament.findOrCreate ({
        where:{name: temperamentMap}
})});

const dogTemperament = await Temperament.findAll();
res.send(dogTemperament)

}
catch(error){
    next(error)
}})


module.exports = temperamentsRoute;