import { useEffect, useState } from "react";
const KEY = "46f65c45";

//custom hook for everything that needs to search for movies

export function useMovies(query) {

    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("")

    useEffect(function () {
        // callback?.()

        //fetch cleaner
        const controller = new AbortController()
  
        async function fetchMovies() {
        try { 
          setIsLoading(true);
          setError("");
  
          const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}{}`,
          {signal: controller.signal}
        );
  
          if(!res.ok) 
          throw new Error("Something went wrong with fetching movies")
  
        const data = await res.json();
  
        if (data.Response === "False") throw new Error
        ("Movie not found")
  
  
        setMovies(data.Search)
        setError("")
       //console.log(data.Search)
  
        } catch (err) {
          console.log(err.message)
          setError(err.message)
  
          //to ignore the error, that shows up beacuse the fetch request is cancelled.
          //if error name is different from abort, only then set error
          if (err.name !== "AbortError") {
            setError(err.message)
          }
  
        } finally{
          setIsLoading(false)
        }
      }
  
      if(query.length < 3) {
        setMovies([])
        setError("")
        return;
      }
  
      fetchMovies();
  
      //controller abort the current fetch request
      return function () {
        controller.abort();
      };
      },
      [query]
    );
    //returning objects that we need outside this hook
    return {movies, isLoading, error}
}