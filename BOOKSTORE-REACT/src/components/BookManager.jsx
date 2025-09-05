import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import config from './config.js';

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState({
    isbn: '',
    title: '',
    author: '',
    price: ''
  });
  const [isbnToFetch, setIsbnToFetch] = useState('');
  const [fetchedBook, setFetchedBook] = useState(null);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const baseUrl = `${config.url}/bookapi`;

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    try {
      const res = await axios.get(`${baseUrl}/all`);
      setBooks(res.data);
    } catch (error) {
      setMessage('Failed to fetch books.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    for (let key in book) {
      if (!book[key] || book[key].toString().trim() === '') {
        setMessage(`Please fill out the ${key} field.`);
        setTimeout(() => {
          setMessage('');
        }, 3000);
        return false;
      }
    }
    if (book.price && isNaN(book.price)) {
      setMessage('Price must be a valid number.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
      return false;
    }
    return true;
  };

  const addBook = async () => {
    if (!validateForm()) return;
    try {
      const bookData = {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        price: parseFloat(book.price)
      };
      await axios.post(`${baseUrl}/add`, bookData);
      setMessage('Book added successfully.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
      fetchAllBooks();
      resetForm();
    } catch (error) {
      setMessage('Error adding book.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const updateBook = async () => {
    if (!validateForm()) return;
    try {
      const bookData = {
        title: book.title,
        author: book.author,
        price: parseFloat(book.price)
      };
      await axios.put(`${baseUrl}/update/${book.isbn}`, bookData);
      setMessage('Book updated successfully.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
      fetchAllBooks();
      resetForm();
    } catch (error) {
      setMessage('Error updating book.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const deleteBook = async (isbn) => {
    try {
      await axios.delete(`${baseUrl}/delete/${isbn}`);
      setMessage('Book deleted successfully.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
      fetchAllBooks();
    } catch (error) {
      setMessage('Error deleting book.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const getBookByIsbn = async () => {
    try {
      const res = await axios.get(`${baseUrl}/get/${isbnToFetch}`);
      setFetchedBook(res.data);
      setMessage('');
    } catch (error) {
      setFetchedBook(null);
      setMessage('Book not found.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const handleEdit = (bookItem) => {
    setBook({
      isbn: bookItem.isbn,
      title: bookItem.title,
      author: bookItem.author,
      price: bookItem.price.toString()
    });
    setEditMode(true);
    setMessage(`Editing book with ISBN ${bookItem.isbn}`);
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  const resetForm = () => {
    setBook({
      isbn: '',
      title: '',
      author: '',
      price: ''
    });
    setEditMode(false);
  };

  return (
    <div className="book-container">

      {message && (
        <div className={`message-banner ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <h2>Book Management - Jenkins Full Stack Practice</h2>

      <div>
        <h3>{editMode ? 'Edit Book' : 'Add Book'}</h3>
        <div className="form-grid">
          <input 
            type="text" 
            name="isbn" 
            placeholder="ISBN (e.g., 978-3-16-148410-0)" 
            value={book.isbn} 
            onChange={handleChange}
            disabled={editMode}
            required
          />
          <input 
            type="text" 
            name="title" 
            placeholder="Book Title" 
            value={book.title} 
            onChange={handleChange} 
            required
          />
          <input 
            type="text" 
            name="author" 
            placeholder="Author Name" 
            value={book.author} 
            onChange={handleChange} 
            required
          />
          <input 
            type="number" 
            name="price" 
            placeholder="Price" 
            value={book.price} 
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="btn-group">
          {!editMode ? (
            <button className="btn-blue" onClick={addBook}>Add Book</button>
          ) : (
            <>
              <button className="btn-green" onClick={updateBook}>Update Book</button>
              <button className="btn-gray" onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div>
        <h3>Get Book By ISBN</h3>
        <input
          type="text"
          value={isbnToFetch}
          onChange={(e) => setIsbnToFetch(e.target.value)}
          placeholder="Enter Book ISBN"
        />
        <button className="btn-blue" onClick={getBookByIsbn}>Fetch Book</button>

        {fetchedBook && (
          <div>
            <h4>Book Found:</h4>
            <div className="book-details">
              <p><strong>ISBN:</strong> {fetchedBook.isbn}</p>
              <p><strong>Title:</strong> {fetchedBook.title}</p>
              <p><strong>Author:</strong> {fetchedBook.author}</p>
              <p><strong>Price:</strong> ${fetchedBook.price}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3>All Books</h3>
        {books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((bookItem) => (
                  <tr key={bookItem.isbn}>
                    <td>{bookItem.isbn}</td>
                    <td>{bookItem.title}</td>
                    <td>{bookItem.author}</td>
                    <td>${bookItem.price}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-green" onClick={() => handleEdit(bookItem)}>Edit</button>
                        <button className="btn-red" onClick={() => deleteBook(bookItem.isbn)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default BookManager;