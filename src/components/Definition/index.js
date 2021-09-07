import { useState, useEffect, Fragment } from 'react'
import { Stack, Typography, Box, IconButton, Divider, CircularProgress, useTheme, Button, styled } from '@material-ui/core'
import { ArrowBack as BackIcon, BookmarkBorder as BookmarkIcon, Bookmark as BookmarkedIcon, PlayArrow as PlayIcon } from '@material-ui/icons'
import { useParams, useHistory } from 'react-router-dom'
import axios from 'axios'

const AlignCenterBox = styled(Box)(({ theme }) => ({ ...theme.mixins.alignInTheCenter }))

const Definition = ({ bookmarks,
    addBookmark,
    removeBookmark }) => {
    const { word } = useParams();
    const history = useHistory();
    const [definitions, setDefinitions] = useState([])
    const [exist, setExist] = useState(true)
    const [audio, setAudio] = useState(null)

    const isBookmarked = Object.keys(bookmarks).includes(word)

    const updateState = data => {
        setDefinitions(data)
        const phonetics = data[0].phonetics
        if (!phonetics.length) return;
        const url = phonetics[0].audio.replace('//ssl', 'https://ssl');
        setAudio(new Audio(url));
    }

    useEffect(() => {
        const fetchDefinition = async () => {
            try {
                const resp = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                updateState(resp.data)
            } catch (err) {
                setExist(false)
            }
        }

        if (!isBookmarked) fetchDefinition()
        else updateState(bookmarks[word])
    }, [])



    if (!exist) return <AlignCenterBox>
        <Typography>Word not found</Typography>
        <Button variant="contained" sx={{ textTransform: 'capitalize', mt: 2 }} onClick={history.goBack}>Go back</Button>
    </AlignCenterBox>

    if (!definitions.length) return <AlignCenterBox ><CircularProgress /></AlignCenterBox>

    return (
        <>
            <Stack direction="row" justifyContent="space-between">
                <IconButton onClick={history.goBack}>
                    <BackIcon sx={{ color: 'black' }} />
                </IconButton>
                <IconButton onClick={() => isBookmarked ? removeBookmark(word) : addBookmark(word, definitions)}>
                    {isBookmarked ? <BookmarkedIcon sx={{ color: 'black' }} /> : <BookmarkIcon sx={{ color: 'black' }} />}
                </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
                mt: 3,
                background: 'linear-gradient(90.17deg, #191E5D 0.14%, #0F133A 98.58%)',
                boxShadow: '0px 10px 20px rgba(19, 23, 71, 0.25)',
                px: 4,
                py: 5,
                color: 'white',
                borderRadius: 2,
            }} >
                <Typography sx={{ textTransform: 'capitalize' }} variant="h5">{word}</Typography>
                {audio && <IconButton onClick={() => audio.play()} sx={{
                    borderRadius: 2,
                    p: 1,
                    color: '#fff',
                    background: theme => theme.palette.pink,
                }} ><PlayIcon /></IconButton>}
            </Stack>

            {definitions.map((def, idx) =>
                <Fragment key={idx}>
                    <Divider sx={{ display: idx === 0 ? 'none' : 'block', my: 3 }} />
                    {def.meanings.map(meaning =>
                        <Box key={Math.random()} sx={{
                            boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.05)',
                            backgroundColor: '#fff',
                            p: 2,
                            borderRadius: 2,
                            mt: 3
                        }}>
                            <Typography sx={{ textTransform: 'capitalize' }} color="GrayText" variant="subtitle1">{meaning.partOfSpeech}</Typography>
                            {meaning.definitions.map((definition, idx) => <Typography sx={{ my: 1 }} variant="body2" color="GrayText" key={definition.definition}>{meaning.definitions.length > 1 && `${idx + 1}. `} {definition.definition}</Typography>)}
                        </Box>
                    )}
                </Fragment>
            )}
        </>
    )
}

export default Definition
