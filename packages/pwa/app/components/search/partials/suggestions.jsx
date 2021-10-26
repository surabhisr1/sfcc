/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import PropTypes from 'prop-types'
import {Text, Button, Stack, Box} from '@chakra-ui/react'

const Suggestions = ({suggestions, closeAndNavigate}) => {
    if (!suggestions) {
        return null
    }
    return (
        <Stack spacing={0} data-testid="sf-suggestion">
            <Box mx={'-16px'}>
                {suggestions.map((suggestion, idx) => (
                    <Button
                        width="full"
                        onMouseDown={() => closeAndNavigate(suggestion.link)}
                        fontSize={'md'}
                        key={idx}
                        marginTop={0}
                        variant="menu-link"
                    >
                        <Text
                            fontWeight="400"
                            dangerouslySetInnerHTML={{__html: suggestion.name}}
                        />
                    </Button>
                ))}
            </Box>
        </Stack>
    )
}

Suggestions.propTypes = {
    suggestions: PropTypes.array,
    closeAndNavigate: PropTypes.func
}

export default Suggestions
