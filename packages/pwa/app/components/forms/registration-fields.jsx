/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import PropTypes from 'prop-types'
import {Stack} from '@chakra-ui/react'
import useRegistrationFields from './useRegistrationFields'
import Field from '../field'
import PasswordRequirements from './password-requirements'

const RegistrationFields = ({form, prefix = ''}) => {
    const fields = useRegistrationFields({form, prefix})
    const password = form.watch('password')

    return (
        <Stack spacing={5}>
            <Field {...fields.firstName} />
            <Field {...fields.lastName} />
            <Field {...fields.email} />

            <Stack spacing={3} pb={2}>
                <Field {...fields.password} />
                <PasswordRequirements value={password} />
            </Stack>

            <Field {...fields.acceptsMarketing} inputProps={{alignItems: 'flex-start'}} />
        </Stack>
    )
}

RegistrationFields.propTypes = {
    /** Object returned from `useForm` */
    form: PropTypes.object.isRequired,

    /** Optional prefix for field names */
    prefix: PropTypes.string
}

export default RegistrationFields
