import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from 'react-router-dom'
import { useUpdateNoteMutation, useDeleteNoteMutation } from "./notesApiSlice"
import { useGetNotesQuery } from './notesApiSlice'
import { memo } from 'react'
import useAuth from "../../hooks/useAuth"

const Note = ({ noteId }) => {

    const { isManager, isAdmin } = useAuth()

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[noteId]
        }),
    })

    const [updateNote, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateNoteMutation()

    const [deleteNote, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteNoteMutation()

    const navigate = useNavigate()
    const [title, setTitle] = useState(note.title)
    const [text, setText] = useState(note.text)
    const [userId, setUserId] = useState(note.user)
    const [category, setCategory] = useState(note.category)
    const [completed, setCompleted] = useState(note.completed)

    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setTitle('')
            setText('')
            setUserId('')
            setCategory('Laptop')
            navigate('/dash/notes')
        }

    }, [isSuccess, isDelSuccess, navigate])

    const onNoteComplete = async () => {
        await updateNote({ id: note.id, user: userId, title, text, category, completed })
    }    
    
    const onCompletedClicked = e =>  { 
        setCompleted(prev => !prev)
        onNoteComplete()
    }

    const onDeleteNoteClicked = async () => {
        await deleteNote({ id: note.id })
    }

    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"    
    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    let deleteButton = null
    if (isManager || isAdmin) {
        deleteButton = (
            <button
                className="icon-button table__button"
                title="Delete"
                onClick={onDeleteNoteClicked}
            >
                <FontAwesomeIcon icon={faTrashCan} />
            </button>
        )
    }

    if (note) {
        const created = new Date(note.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long' })

        const updated = new Date(note.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long' })

        const handleEdit = () => navigate(`/dash/notes/${noteId}`)

        return (
            <tr className="table__row">
                <td className="table__cell note__status">
                    {note.completed
                        ? <span className="note__status--completed">Completed</span>
                        : <span className="note__status--open">Open</span>
                    }
                </td>
                <td className="table__cell note__created">{created}</td>
                <td className="table__cell note__title">{note.title}</td>
                <td className="table__cell note__category">{note.category}</td>                
                <td className="table__cell note__username">{note.username}</td>
                <td className="table__cell">                              
                    <input
                        className="icon-button table__button"
                        id={note.id}
                        name="completed"
                        type="checkbox"
                        checked={completed}
                        onChange={onCompletedClicked}
                    />
                    <button
                        className="icon-button table__button"
                        onClick={handleEdit}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <div>{deleteButton}
                    </div>
                    
                </td>
            </tr>
        )

    } else return null
}

const memoizedNote = memo(Note)

export default memoizedNote