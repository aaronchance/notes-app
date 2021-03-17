import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsPencilSquare } from "react-icons/bs";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [searchString, setSearchString] = useState('');
  const [replaceString, setReplaceString] = useState('');
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setNotes(notes);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  async function handleSubmitClick(event) {
    event.preventDefault();
    let search = searchString;
    setSearchString('');
    if(!search || !replaceString) return
    setIsWorking(true);
    notes.filter(note => {
      return note.content.toLowerCase().includes(searchString.toLowerCase());
    }).map(async (note) => {
      note.content = note.content.toLowerCase().replaceAll(searchString, replaceString);
      await API.put("notes", `/notes/${note.noteId}`, {
        body: note
      });
    })
    try {
      const notes = await loadNotes();
      setNotes(notes)
      setSearchString('')
    } catch(e) {
      onError(e)
    }
    setIsWorking(false);
  }

  function renderNotesList(notes) {
    return (
      <>
        <Form className="BillingForm" onSubmit={handleSubmitClick}>
          <Form.Group size="lg" controlId="searchString">
            <Form.Control
              type="text"
              value={searchString}
              onChange={event => setSearchString(event.target.value)}
              placeholder="Search"
            />
          </Form.Group>
          <Form.Group size="lg" controlId="replaceString">
            <Form.Control
              type="text"
              value={replaceString}
              onChange={event => setReplaceString(event.target.value)}
              placeholder="Replace"
            />
          </Form.Group>
          <LoaderButton
            block
            size="lg"
            type="submit"
            isLoading={isWorking}
            disabled={isWorking}
          >
            { isWorking ? 'Working on it...' : 'Search & Replace' }
          </LoaderButton>
        </Form>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.filter(item => {
          if (!searchString) return true
          return item.content.toLowerCase().includes(searchString.toLowerCase())
        })
          .map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br />
              <span className="text-muted">
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="pt-3">
          <Link to="/login" className="btn btn-info btn-lg mr-3">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
      </div>
    );
  }
  
  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
