import React, {useState} from 'react';
import { Form, Button, Card } from 'react-bootstrap';
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
                    <div className='mt-4'>

                        <h5>The recommended restaurants are:    </h5>
                        <Card className = "mt-1">
                            <Card.Body>
                                <Card.Title>1.Maria si Ion</Card.Title>
                                <Card.Text>
                                    Best Romanian Traditional food for students
                                </Card.Text>
                                <Button variant="primary">Go somewhere</Button>
                            </Card.Body>
                        </Card>

                        <Card  className = "mt-3">
                            <Card.Body>
                                <Card.Title>2.Trattoria</Card.Title>
                                <Card.Text>
                                    Traditional food
                                </Card.Text>
                                <Button variant="primary">Go somewhere</Button>
                            </Card.Body>
                        </Card>

                    </div>
                }
           </Form>
            </div>
        </main>
    )
}

export default Fields;