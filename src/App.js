import { useEffect, useRef, useState } from "react";
import StarRating from './StarRating'
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "46f65c45";
  export default function App() {
    const [query, setQuery] = useState("");
   
    const [selectedId, setSelectedId] = useState(null)
   
    const { movies, isLoading, error } = useMovies(query)

    const [watched, setWatched] = useLocalStorageState([], 'watched')

      
 
function handleSelectMovie(id) {
  // if current id equal to selected id? if so set new on to null.. this will close automatically when clicking on a new movie
  setSelectedId((selectedId) => (id === selectedId ? null : id))
}
function handleCloseMovie(id) {
  setSelectedId(null)
}

//we create a new array based on the array and the new movi object
function handleAddWatchedMovie(movie) {
  setWatched((watched) => [...watched, movie])

  // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
}

//check if the id is the same.. if its the same, then the movie will be filtered out
function handleDeleteWatched(id) {
  setWatched((watched) => watched.filter((movie)=>
  movie.imdbID !== id ))
}


    //never set state in the render logic => infinite loop

    return (
      <>
    <NavBar>
    <Search query={query} setQuery={setQuery}/>
    <NumResults movies ={movies}/>
    </NavBar>

    <Main>
    <Box>
    {/* {isLoading ? <Loader/> : <MovieList movies ={movies}/>} */}

    {/*  if it is loading => show loader */}
    {isLoading && <Loader/>}
    {/*  if it is not loading and there is no error => show movies */}
    {!isLoading && !error && (
    <MovieList movies ={movies} onSelectMovie={handleSelectMovie}/>)}
      {/* if there is an error => show error message */}
    {error && <ErrorMessage message={error} />}
    </Box>

    <Box>
    {selectedId? (
    <MovieDetails 
    selectedId={selectedId} 
    onCloseMovie={handleCloseMovie}
    onAddWatched={handleAddWatchedMovie}
    watched={watched}
    />
    ) : (
      // use fragment, cause cannot have two elements as the root element, so with the fragment we created one element
    <>
    <WatchedSummary watched={watched}/>
    <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched}/>
    </>
    )}
    </Box>

    </Main>
      </>
    );
  }

  function Loader() {
    return <p className="loader">Loading...</p>
  }

  function ErrorMessage({message}) {
    return (<p className="error">
      <span>⛔</span> {message}
    </p>)
  }
  function NavBar ({children}) {

    return (
      <nav className="nav-bar">
    <Logo/>

    {children}
     </nav>
    )
  }

  function Logo () {

    return (
      <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
    )
  }

 


  function Search({query, setQuery}) {
    //input-element is what we store in the ref
   const inputEl = useRef(null)

   useKey('Enter', function() {
    if(document.activeElement === inputEl.current) return
    inputEl.current.focus()
    setQuery('')

  })

    return (
      <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
    )
  }
 function NumResults({movies}) {

    return (
      <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
    )
  }

function Main ({children}) {

  return (
    <main className="main">
   
   {children}
   
  </main>
  )
}

function Box ({children}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
    {isOpen && children}
  </div>
  )
}



 function MovieList ({movies, onSelectMovie}) {

  return (
    <ul className="list list-movies">
        {movies?.map((movie) => (
         <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
        ))}
      </ul>
  )
 }


function Movie ({movie, onSelectMovie}) {
  return(
    <li onClick={() => onSelectMovie(movie.imdbID)}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
  )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {

const [movie, setMovie] = useState({})
const [isLoading, setIsLoading] = useState(false);
const [userRating, setUserRating] = useState('');

//transform to a list with movie id's and check if the list already includes the selected id
const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
const watchedUserRating = watched.find(
  movie => movie.imdbID === selectedId
)?.userRating;



const {
  Title: title, 
  Year: year, 
  Poster: poster, 
  Runtime: runtime,
  imdbRating,
  Plot: plot,
  Released: released, 
  Actors:actors, 
  Director: director, 
  Genre: genre,
} = movie;


// if (imdbRating > 8) [isTop, setIsTop] = useState(true)

const isTop = imdbRating > 8;

console.log(isTop)

// const [avgRating, setAvgRating] = useState(0)


function handleAdd() {
  const newWatchedMovie = {
  imdbID: selectedId,
  title,
  year,
  poster,
  imdbRating: Number(imdbRating),
  runtime: Number(runtime.split(' ').at(0)),
  userRating


  }
  //after adding a movie, it closes the tab and open the list of added movies
  onAddWatched(newWatchedMovie)
  onCloseMovie()

  // setAvgRating(Number(imdbRating))
  // setAvgRating((avgRating) => (avgRating + imdbRating)/ 2)
  
}

useKey('Escape', onCloseMovie)

//keypress function
// useEffect(
//   function() {
//   function callback (e) {
//   if (e.code === "Escape") {
//     onCloseMovie()
//   }
// }
// document.addEventListener("keydown", callback)

//   //cleanup
//   return function() {
//     document.removeEventListener('keydown', callback)
//   }
// }, [onCloseMovie])

useEffect(function getMovieDetails() {
  async function getMovieDetails() {
    setIsLoading(true)
    const res = await fetch(
      `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
    )
    const data = await res.json();
    setMovie(data)
    setIsLoading(false)
  }
  getMovieDetails()
}, [selectedId])

//changes the tab title
useEffect(
  function() {
  if (!title) return;
  document.title =`Movie | ${title}`

  //cleanup effect
  return function () {
    document.title = "usePopcorn"
    //console.log(`clean up effect for movie ${title}`)
  }
}, [title])

  return(
    <div className="details">
      { isLoading ? (
      <Loader/> 
      ) : (
      <>
       <header>
      <button className="btn-back" onClick={onCloseMovie} > 
      {/*  &larr  => left arrow */}
      &larr; 
      </button>
     <img src={poster} alt={`Poster of ${movie} movie`}/>
<div className="details-overview">
  <h2>{title}</h2>
  <p>{released} &bull; {runtime}</p>
  <p>{genre}</p>
  <p>
  <span>⭐</span>
  {imdbRating} IMDB rating
  </p>
</div>
</header>

{/* <p>{avgRating}</p> */}

<section>
  <div className="rating">
 { !isWatched ? (
 <>
 <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>

{/* if userrating is grater than 0, then show the button */}
  {userRating > 0 && (
  <button className="btn-add" onClick=
  {handleAdd}>+ Add to list</button>
  )}
  </> 
) : (

  <p>You rated with movie {watchedUserRating}
  <span> ⭐</span>
  </p>
)}
</div>

  <p>
    <em>{plot}</em>
  </p>
  <p>Starring {actors}</p>
  <p>Directed by {director}</p>
</section>
</>
  )}
</div>
  );
}

function WatchedSummary ({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
          <h2>Movies you watched</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{watched.length} movies</span>
            </p>
            <p>
              <span>⭐️</span>
              <span>{avgImdbRating.toFixed(1)}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{avgUserRating.toFixed(1)}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{avgRuntime} min</span>
            </p>
          </div>
        </div>
  )
}

function WatchedMovieList ({watched, onDeleteWatched}) {
  return(
    <ul className="list">
          {watched.map((movie) => (
           <WatchedMovie movie ={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>
          ))}
        </ul>
  )
}

function WatchedMovie ({movie, onDeleteWatched}) {
  return(
    <li >
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>

      <button className="btn-delete" onClick={() =>
      onDeleteWatched(movie.imdbID)}>X</button>
    </div>
  </li>
  )
}