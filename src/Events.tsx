import { ReactElement } from "react";
import { Card, ListGroup } from "react-bootstrap";

interface Props {
  eventElements: Array<ReactElement>;
}

export default function Events({ eventElements }: Props) {
  return (
    <>
      <Card.Body>
        <Card.Title>Events ({eventElements.length})</Card.Title>
        <ListGroup>
          {eventElements.map((e, idx) => (
            <ListGroup.Item key={idx}>{e}</ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </>
  );
}
