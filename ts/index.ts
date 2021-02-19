import express from 'express';
const router = express.Router();
import { Productos } from './Productos';

const PORT = '8080'
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const consolas = new Productos();

app.use('/api/productos', router);

app.use('/',express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/api', (req, res) => {
    res.send('Punto de entrada de la aplicación');
})

router.get('/list', async (req, res) => {
    try{
        await res.render(__dirname + '/views/pages/index', {
            products: consolas.getProductos(),
            message: 'No existen productos'
        });
    }catch(err) {
        console.log(err)
    } 
});

router.get('/', (req, res) => {
    try{
        if(consolas.getProductos().length > 0) res.json(consolas.getProductos());
        else res.json({msg: 'No hay productos'});
    }catch(err){
        console.log(err);
    }
});

router.get('/api', (req, res) => {
    console.log('Punto de entrada de la aplicación')
});

router.get('/productos/:id', (req, res) => {
    const id = req.params.id;
    const producto = consolas.findProducto(parseInt(id));
    if(!producto) res.json({error: 'Producto no encontrado'})
    else res.json(producto);
})

function validar (req:any, res:any, next:any):void {
    if(req.body.title === '' 
    || req.body.price === '' 
    || req.body.thumbnail === '') {
        res.send('No se completaron todos los campos del formulario');
        
    } else {
        req.body.price = parseInt(req.body.price);
        next();
    }
}

app.post('/producto', validar , (req, res) => {
    
    const producto = req.body;
    consolas.setProductos(producto);
    res.writeHead(301, {
        Location: 'http://localhost:8080/'
    });
    res.end();
})

router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const producto = consolas.findProducto(id);
    if(!producto) res.sendStatus(404);
    else {
        const productoUpdated = {
            id: id,
            title: req.body.title,
            price: req.body.price,
            thumbnail: req.body.thumbnail
        }
        consolas.updateProducto(productoUpdated);
        res.json({
            "title": req.body.title,
            "price": req.body.price,
            "thumbnail": req.body.thumbnail,
            "id": id
        });
    }
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const producto = consolas.findProducto(parseInt(id));
    if(!producto) res.sendStatus(404);
    else {
        consolas.deleteProducto(parseInt(id));
        res.json({
            message: 'Producto eliminado',
            producto: producto});
    } 
});

app
    .listen(PORT, () => console.log('Server listening in port ', PORT))
    .on("error", (err) => console.log(`Se ha producido el siguiente error: ${err}`));