/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import {screen} from '@testing-library/react'

import Footer from './index'
import {renderWithProviders} from '../../utils/test-utils'

test('renders component', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByRole('link', {name: 'Privacy Policy'})).toBeInTheDocument()
})

test('renders mobile version by default', () => {
    renderWithProviders(<Footer />)
    // This link is hidden initially, but would be shown for desktop
    expect(screen.getByRole('link', {name: 'About Us', hidden: true})).toBeInTheDocument()
})
