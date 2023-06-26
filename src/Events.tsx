import { ReactElement } from "react";
import { Card, ListGroup } from "react-bootstrap";

interface Props {
  eventElements: Array<ReactElement>;
}

export default function Events({ eventElements }: Props) {
  return (
    <>
      <Card>
        <Card.Header>Events ({eventElements.length})</Card.Header>
        <Card.Body>
          <ListGroup>
            {eventElements.map((e, idx) => (
              <ListGroup.Item key={idx}>{e}</ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </>
  );
}
