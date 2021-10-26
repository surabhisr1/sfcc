/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import {screen, waitFor, within} from '@testing-library/react'
import user from '@testing-library/user-event'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {renderWithProviders} from '../../utils/test-utils'
import ResetPassword from '.'

jest.setTimeout(60000)

const mockRegisteredCustomer = {
    authType: 'registered',
    customerId: 'registeredCustomerId',
    customerNo: 'testno',
    email: 'darek@test.com',
    firstName: 'Tester',
    lastName: 'Testing',
    login: 'darek@test.com'
}

jest.mock('commerce-sdk-isomorphic', () => {
    const sdk = jest.requireActual('commerce-sdk-isomorphic')
    return {
        ...sdk,
        ShopperCustomers: class ShopperCustomersMock extends sdk.ShopperCustomers {
            async registerCustomer() {
                return mockRegisteredCustomer
            }

            async getCustomer(args) {
                if (args.parameters.customerId === 'customerid') {
                    return {
                        authType: 'guest',
                        customerId: 'customerid'
                    }
                }
                return mockRegisteredCustomer
            }

            async authorizeCustomer() {
                return {
                    headers: {
                        get(key) {
                            return {authorization: 'guestToken'}[key]
                        }
                    },
                    json: async () => ({
                        authType: 'guest',
                        customerId: 'customerid'
                    })
                }
            }
        }
    }
})

const MockedComponent = () => {
    return (
        <div>
            <ResetPassword />
        </div>
    )
}

const server = setupServer(
    rest.post('*/oauth2/authorize', (req, res, ctx) =>
        res(ctx.delay(0), ctx.status(303), ctx.set('location', `/testcallback`))
    ),

    rest.get('*/oauth2/authorize', (req, res, ctx) =>
        res(ctx.delay(0), ctx.status(303), ctx.set('location', `/testcallback`))
    ),

    rest.get('*/testcallback', (req, res, ctx) => {
        return res(ctx.delay(0), ctx.status(200))
    }),

    rest.post('*/oauth2/token', (req, res, ctx) =>
        res(
            ctx.delay(0),
            ctx.json({
                customer_id: 'test',
                access_token: 'testtoken',
                refresh_token: 'testrefeshtoken',
                usid: 'testusid',
                enc_user_id: 'testEncUserId'
            })
        )
    )
)

// Set up and clean up
beforeEach(() => {
    jest.resetModules()
    server.listen({
        onUnhandledRequest: 'error'
    })
    // Need to mock TextEncoder for tests
    if (typeof TextEncoder === 'undefined') {
        global.TextEncoder = require('util').TextEncoder
    }

    window.history.pushState({}, 'Reset Password', '/en/reset-password')
})
afterEach(() => {
    localStorage.clear()
    server.resetHandlers()
    window.history.pushState({}, 'Reset Password', '/en/reset-password')
})
afterAll(() => server.close())

test('Allows customer to go to sign in page', async () => {
    // render our test component
    renderWithProviders(<MockedComponent />)

    user.click(screen.getByText('Sign in'))
    await waitFor(() => {
        expect(window.location.pathname).toEqual('/en/login')
    })
})

test('Allows customer to generate password token', async () => {
    // mock reset password request
    server.use(
        rest.post('*/create-reset-token', (req, res, ctx) =>
            res(
                ctx.delay(0),
                ctx.json({
                    email: 'foo@test.com',
                    expiresInMinutes: 10,
                    login: 'foo@test.com',
                    resetToken: 'testresettoken'
                })
            )
        )
    )

    // render our test component
    renderWithProviders(<MockedComponent />)

    // enter credentials and submit
    user.type(screen.getByLabelText('Email'), 'foo@test.com')
    user.click(within(screen.getByTestId('sf-auth-modal-form')).getByText(/reset password/i))

    // wait for success state
    expect(await screen.findByText(/password reset/i, {}, {timeout: 12000})).toBeInTheDocument()
    expect(screen.getByText(/foo@test.com/i)).toBeInTheDocument()

    user.click(screen.getByText('Back to sign in'))
    await waitFor(() => {
        expect(window.location.pathname).toEqual('/en/login')
    })
})

test('Renders error message from server', async () => {
    server.use(
        rest.post('*/create-reset-token', (req, res, ctx) =>
            res(
                ctx.delay(0),
                ctx.json({
                    detail: 'Something went wrong',
                    title: 'Error',
                    type: '/error'
                })
            )
        )
    )

    renderWithProviders(<MockedComponent />)

    user.type(screen.getByLabelText('Email'), 'foo@test.com')
    user.click(within(screen.getByTestId('sf-auth-modal-form')).getByText(/reset password/i))

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
})
