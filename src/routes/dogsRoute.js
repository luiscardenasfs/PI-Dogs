const axios = require('axios');
const { Router } = require("express");
const { Dog, Temperament } = require('../db');
const dogsRoute = Router();
const { Op } = require('sequelize')


// ] GET /dogs:
// Obtain breeds listing
// send data to the principal route

dogsRoute.get('', async (req, res, next) => {

    // [ ] GET /dogs?name="...":
    // Obtain a listing of the dog breeds wich contains the input que as query parameter
    // if the breed doesn't exist, pop an alert

    let searchName = req.query.name
    if (!searchName) { // if not specifies ====> brings DB and API

        const dogApiName = await axios.get('https://api.thedogapi.com/v1/breeds')
        const mapApi = await Promise.all(dogApiName.data.map(async (apiMap) => {

            return {
                id: apiMap.id,
                name: apiMap.name,
                minAge: parseInt(apiMap.life_span.split(' ')[0]),
                maxAge: parseInt(apiMap.life_span.split(' ')[2]),
                img: apiMap.image.url,
                temperament: apiMap.temperament?.split(', '),
                minHeight: parseInt(apiMap.height.metric.split(' ')[0]),
                maxHeight: parseInt(apiMap.height.metric.split(' ')[2]),
                createBy: 'api',
                // sort:
                minWeight: parseInt(apiMap.weight.metric.split(' ')[0]),
                maxWeight: parseInt(apiMap.weight.metric.split(' ')[2]),

            }
        }))

        const dbCreated = await Dog.findAll({ include: { model: Temperament } });

        const mapDb = dbCreated.map(m => {
            return {
                id: m.id,
                name: m.name,
                minAge: m.minAge,
                maxAge: m.maxAge,
                img: m.img,
                temperament: m.temperaments?.map(m => m.name),
                minWeight: m.minWeight,
                maxWeight: m.maxWeight,
                minHeight: m.minHeight,
                maxHeight: m.maxHeight,
                createBy: 'database',

            }
        })
        const union = mapApi.concat(mapDb);
        res.send(union);
        return union;

    } else {


        const dogApi = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=live_TORQ3Q7OL9qFFyfIlogWfCdXJKWtyk0mjuBCavTKGIad8rTG2FPwAzjFVfBosSV5`)

        const includingName = dogApi.data.filter(filter => filter.name.toLowerCase().includes(searchName.toLowerCase()));
        const databaseCreated = await Dog.findAll({ where: { name: { [Op.iLike]: '%' + searchName + '%' } }, include: { model: Temperament } });
        //require all the info from the DB and apply a filter and add temperament
        try {

            const mapApi = await Promise.all(includingName.map(async (apiMap) => {
                return {
                    id: apiMap.id,
                    name: apiMap.name,
                    minAge: parseInt(apiMap.life_span.split(' ')[0]),
                    maxAge: parseInt(apiMap.life_span.split(' ')[2]),
                    img: apiMap.image.url,
                    temperament: apiMap.temperament?.split(', '),
                    minHeight: parseInt(apiMap.height.metric.split(' ')[0]),
                    maxHeight: parseInt(apiMap.height.metric.split(' ')[2]),
                    createBy: 'api',
                    minWeight: parseInt(apiMap.weight.metric.split(' ')[0]),
                    maxWeight: parseInt(apiMap.weight.metric.split(' ')[2]),

                }
            }))


            const mapeo = databaseCreated.map(m => {
                return {
                    id: m.id,
                    name: m.name,
                    minAge: m.minAge,
                    maxAge: m.maxAge,
                    img: m.img,
                    temperament: m.temperaments?.map(m => m.name),
                    minHeight: m.minHeight,
                    maxHeight: m.maxHeight,
                    createBy: 'database',
                    minWeight: m.minWeight,
                    maxWeight: m.maxWeight

                }
            })

            const bleend = mapApi.concat(mapeo);
            res.send(bleend.length === 0 ? ['We dont have that Dog!'] : bleend)
            console.log(bleend)


            return bleend
        } catch (error) {
            next(error)
        }


    }
})



// [ ] GET /dogs/{idRaza}:
// Obtener el detalle de una raza de perro en particular
// Debe traer solo los datos pedidos en la ruta de detalle de raza de perro
// Incluir los temperamentos asociados

dogsRoute.get('/:id', async (req, res, next) => {

    const { id } = req.params;
    if (id.length > 10) {

        try {
            const full = await Dog.count();

            if (full) {
                let dogDb = await Dog.findOne({
                    where: { id: id },
                    include: { model: Temperament }
                })


                const doggTable = {
                    id: dogDb.id,
                    name: dogDb.name,
                    minAge: dogDb.minAge,
                    maxAge: dogDb.maxAge,
                    img: dogDb.img,
                    temperament: dogDb.temperaments?.map(tempMap => tempMap.name),
                    minWeight: dogDb.minWeight,
                    maxWeight: dogDb.maxWeight,
                    minHeight: dogDb.minHeight,
                    maxHeight: dogDb.maxHeight,
                    createBy: 'database',
                    // minWeight: parseInt(m.weight.split(' ')[0]),
                    // maxWeight: parseInt(m.weight.split(' ')[2]),
                }
                res.send(doggTable)
            }

        } catch (error) {
            next(error)

        }
    }


    if (id.length <= 3) {
        try {
            const dogApiId = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=live_TORQ3Q7OL9qFFyfIlogWfCdXJKWtyk0mjuBCavTKGIad8rTG2FPwAzjFVfBosSV5`)

            const detail = await Promise.all(dogApiId.data.filter(filter => filter.id === parseInt(id)));

            let keep = detail[0]
            let info = {
                id: keep.id,
                name: keep.name,
                minAge: parseInt(keep.life_span.split(' ')[0]),
                maxAge: parseInt(keep.life_span.split(' ')[2]),
                img: keep.image.url,
                temperament: keep.temperament?.split(', '),
                minWeight: parseInt(keep.weight.metric.split(' ')[0]),
                maxWeight: parseInt(keep.weight.metric.split(' ')[2]),
                minHeight: parseInt(keep.height.metric.split(' ')[0]),
                maxHeight: parseInt(keep.height.metric.split(' ')[2]),
                createBy: 'api',
                // minWeight: parseInt(apiMap.weight.metric.split(' ')[0]),
                // maxWeight: parseInt(apiMap.weight.metric.split(' ')[2]),
            }

            res.send(info);
            return info;

        } catch (error) {
            next(error)
        }
    }
})



// [ ] POST /dogs:
// Recibe los datos recolectados desde el formulario controlado de la ruta de creación de raza de perro por body
// Crea una raza de perro en la base de datos relacionada con sus temperamentos

dogsRoute.post('/', async (req, res) => { // /dogs/

    const { name, minAge, maxAge, img, minWeight, maxWeight, minHeight, maxHeight, temperament } = req.body;

    if (!name || !minAge || !maxAge || !img || !minWeight || !maxWeight || !minHeight || !maxHeight || !temperament) return res.status(404).send('Error, try again!');
    try {
        const postDog = await Dog.create({

            name: name,
            minAge: minAge,
            maxAge: maxAge,
            img: img,
            minWeight: minWeight,
            maxWeight: maxWeight,
            minHeight: minHeight,
            maxHeight: maxHeight,


        })

        let temperamentTable = await Temperament.findAll({ where: { name: temperament } });
        console.log(postDog)

        postDog.addTemperament(temperamentTable) //--> vinculacion

        console.log(postDog)
        res.status(201).send('We have a new Dog :)');

    } catch (error) {
        res.status(404).send('Not created :(')
    }
})


//probando ruta delete:
dogsRoute.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {

        if (id) {
            Dog.destroy({ where: { id: id } })
        }
        res.send('We delete that Dog')

    } catch (error) {
        console.log('Deleted')
    }

});



//probando ruta put:
dogsRoute.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {

        if (id) {
            const bkUpdate = await Dog.update(body, { where: { id: id } })

        }
        // res.json({change: true})
        res.send('Changed relese')

    } catch (error) {
        console.log('changed fail')
    }

});
module.exports = dogsRoute;