import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import './Details.css'

const Fields = () => {
    const [food, setFood] = useState(false);

    return (
        <main>
            <div className="articles">
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Kilocalories</Form.Label><br/>
                    <Form.Control type="email" placeholder="0 gr" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Proteins</Form.Label>
                    <Form.Control type="email" placeholder="0 gr" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Proteins</Form.Label>
                    <Form.Control type="password" placeholder="0 gr" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Carbohydrates

                    </Form.Label>
                    <Form.Control type="password" placeholder="0 gr" />
                </Form.Group>


                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>How much hungry are you?</Form.Label><br/>
                    <input type="range" list="tickmarks"/>
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
                </Form.Group>

                <Button variant="primary" onClick = {() => {setFood(true)}}>
                    Submit
                </Button>
 
                {food &&
                    <div>
                    The recommended restaurants are:    
                    </div>
                }
           </Form>
            </div>
        </main>
    )
}

export default Fields;