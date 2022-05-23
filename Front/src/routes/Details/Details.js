import React, {useState, useEffect} from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

import './Details.css'

const Fields = () => {
    const [food, setFood] = useState(false);
    const [meals, setMeals] = useState([]);
    const [spinner, setSpinner] = useState(false);


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(function(position) {
        });
    });

    const [values, setValues] = useState({
        kcal:0,
        fats:0,
        proteins:0,
        hunryMeter:50,
        lat:44.423066,
        lon:25.993926
    });

    const changeValue = e => {
        setValues({...values, [e.target.name]: e.target.value})
    }

    const handleSubmit = async () => {
        setFood(true);
        const url = 'http://localhost:9091/';
        
        const json = { kcal: values.kcal, fats:values.fats, hunryMeter:values.hunryMeter, lat:values.lat, lon:values.lon};
        let message;
        setSpinner(true);
        try {
            const res = await axios.post(url, json);
            message = res.data;
        } catch (e) {
            message = e;
        }
        setSpinner(false);

        //comment this if db works fine
        setMeals(message);
    }

    const allRestaurants = meals.map(function(item, i){
        
        let rest = item;

        if(Array.isArray(rest)){
            rest = rest[0];
        }

        const allMeals = rest.meals.map(function(item, i){        
            return <div>
                {i + 1}. {item.mealName}
            </div>
        })

        return <Card className = "mt-3">
                <Card.Body>
                    <Card.Title>{rest.restaurantName}</Card.Title>
                    <Card.Text>
                        <h6>Restaurant rating: {rest.restaurantRating} </h6>
                        Recommended meals:
                        {allMeals}
                    </Card.Text>
                    <a href={rest.restaurantUrl}><Button variant="warning">Visit</Button></a>
                </Card.Body>
            </Card>
    })

    return (
        <main>
            <div className="articles">
            <Form>
                <h5 className='mt-3'>Please indicate details about food:</h5>
                
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Kilocalories</Form.Label><br/>
                    <Form.Control type="number" name="kcal" value={values.kcal} onChange={changeValue}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Fats (gr)</Form.Label>
                    <Form.Control type="number" name="fats" value={values.fats} onChange={changeValue}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Proteins (gr)</Form.Label>
                    <Form.Control type="number" name="proteins" value={values.proteins} onChange={changeValue}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Carbohydrates (gr)</Form.Label>
                    <Form.Control type="number" placeholder="0" />
                </Form.Group>


                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>How hungry are you?</Form.Label><br/>
                    <span className = "me-2">0</span>
                    <input type="range" list="tickmarks" name="hunryMeter" value={values.hunryMeter} onChange={changeValue}/>
                    <datalist id="tickmarks">
                        <option value="0" label="0%"></option>
                        <option value="10"></option>
                        <option value="20"></option>
                        <option value="30"></option>
                        <option value="40"></option>
                        <option value="50" label="50%"></option>
                        <option value="60"></option>
                        <option value="70"></option>
                        <option value="80"></option>
                        <option value="90"></option>
                        <option value="100" label="100%"></option>
                    </datalist>
                    <span className = "ms-2">100</span>
                </Form.Group>

                <hr/>
                <h5>Please indicate your position:</h5>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Lon:</Form.Label>
                    <Form.Control type="number" placeholder="0 gr" name="lon" value={values.lon} onChange={changeValue}/>
                </Form.Group>

                
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Lat:</Form.Label>
                    <Form.Control type="number" placeholder="0 gr" name="lat" value={values.lat} onChange={changeValue}/>
                </Form.Group>

                {
                    !food && 
                    <Button className='mb-4' variant="primary" onClick = {handleSubmit}>
                        Submit
                    </Button>
                }
                {food &&
                    <div className='mt-4'>
                        <h5>The recommended restaurants are:</h5>
                        {allRestaurants}
                    </div>
                }
                {spinner &&
                    <div className='text-center'>
                        <div className='mt-4 mb-4'>
                            <Spinner animation="border" role="status"/>
                        </div>
                        <Button className='mt-4' variant="primary" >
                            Retry
                        </Button>
                    </div>
                }
           </Form>
            </div>
        </main>
    )
}

export default Fields;