import React, {useEffect, useState, Fragment} from 'react'
import {FormattedMessage, FormattedNumber} from 'react-intl'
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Spacer,
    Stack,
    Text,
    Alert,
    AlertIcon,
    Divider
} from '@chakra-ui/react'
import {useForm} from 'react-hook-form'
import {getCreditCardIcon} from '../../utils/cc-utils'
import useBasket from '../../commerce-api/hooks/useBasket'
import useCustomer from '../../commerce-api/hooks/useCustomer'
import useNavigation from '../../hooks/use-navigation'
import Link from '../../components/link'
import AddressDisplay from '../../components/address-display'
import PostCheckoutRegistrationFields from '../../components/forms/post-checkout-registration-fields'
import PromoPopover from '../../components/promo-popover'
import CartItemVariant from '../../components/cart-item-variant'
import CartItemVariantImage from '../../components/cart-item-variant/item-image'
import CartItemVariantName from '../../components/cart-item-variant/item-name'
import CartItemVariantAttributes from '../../components/cart-item-variant/item-attributes'
import CartItemVariantPrice from '../../components/cart-item-variant/item-price'

const CheckoutConfirmation = () => {
    const navigate = useNavigation()
    const basket = useBasket()
    const customer = useCustomer()

    // The order data will initially be stored as our basket when first coming to this
    // page. We capture it in local state to use for our UI. A new basket will be automatically
    // created so we should only reference our captured order data here.
    const [order] = useState(basket)

    const form = useForm({
        defaultValues: {
            email: customer?.email || order?.customerInfo?.email || '',
            password: '',
            firstName: customer.firstName || order?.billingAddress?.firstName,
            lastName: customer.lastName || order?.billingAddress?.lastName
        }
    })

    // If we don't have an order object on first render we need to transition back to a
    // different page. Fow now, we push to the homepage.
    useEffect(() => {
        if (!order || order._type !== 'order') {
            navigate('/')
        }
    }, [order])

    if (!order || !order.orderNo) {
        return null
    }

    const CardIcon = getCreditCardIcon(order.paymentInstruments[0].paymentCard?.cardType)

    const submitForm = async (data) => {
        try {
            await customer.registerCustomer(data)
        } catch (error) {
            const existingAccountMessage = (
                <Fragment>
                    <FormattedMessage defaultMessage="This email already has an account." />
                    &nbsp;
                    <Link to="/login" color="blue.600">
                        <FormattedMessage defaultMessage="Log in here" />
                    </Link>
                </Fragment>
            )

            const message = /the login is already in use/i.test(error.message)
                ? existingAccountMessage
                : error.message

            form.setError('global', {type: 'manual', message})
            return
        }

        // Customer is successfully registered with a new account,
        // and the recent order would be associated with this account too.
        // Now redirect to the Account page.
        navigate(`/account`)
    }

    return (
        <Box background="gray.50">
            <Container
                maxWidth="container.md"
                py={{base: 7, md: 16}}
                px={{base: 0, md: 4}}
                data-testid="sf-checkout-confirmation-container"
            >
                <Stack spacing={4}>
                    <Box layerStyle="card" rounded={[0, 0, 'base']} px={[4, 4, 6]} py={[6, 6, 8]}>
                        <Stack spacing={6}>
                            <Heading align="center" fontSize={['2xl']}>
                                <FormattedMessage defaultMessage="Thank you for your order!" />
                            </Heading>

                            <Box>
                                <Container variant="form">
                                    <Stack spacing={3}>
                                        <Text align="center">
                                            <FormattedMessage defaultMessage="Order Number" />:{' '}
                                            <Text as="span" fontWeight="bold">
                                                {order.orderNo}
                                            </Text>
                                        </Text>
                                        <Text align="center">
                                            <FormattedMessage
                                                defaultMessage="We will send an email to <b>{email}</b> with your confirmation number and receipt shortly."
                                                values={{
                                                    // eslint-disable-next-line react/display-name
                                                    b: (chunks) => <b>{chunks}</b>,
                                                    email: order.customerInfo.email
                                                }}
                                            />
                                        </Text>

                                        <Spacer />

                                        <Button as={Link} href="/" variant="outline">
                                            <FormattedMessage defaultMessage="Continue Shopping" />
                                        </Button>
                                    </Stack>
                                </Container>
                            </Box>
                        </Stack>
                    </Box>

                    {customer.authType === 'guest' && (
                        <Box
                            layerStyle="card"
                            rounded={[0, 0, 'base']}
                            px={[4, 4, 6]}
                            py={[6, 6, 8]}
                        >
                            <Container variant="form">
                                <Heading fontSize="lg" marginBottom={6}>
                                    <FormattedMessage defaultMessage="Create an account for faster checkout" />
                                </Heading>

                                <form onSubmit={form.handleSubmit(submitForm)}>
                                    <Stack spacing={4}>
                                        {form.errors?.global && (
                                            <Alert status="error">
                                                <AlertIcon />
                                                {form.errors.global.message}
                                            </Alert>
                                        )}

                                        <PostCheckoutRegistrationFields form={form} />

                                        <Button
                                            type="submit"
                                            width="full"
                                            onClick={() => form.clearErrors('global')}
                                            isLoading={form.formState.isSubmitting}
                                        >
                                            <FormattedMessage defaultMessage="Create Account" />
                                        </Button>
                                    </Stack>
                                </form>
                            </Container>
                        </Box>
                    )}

                    <Box layerStyle="card" rounded={[0, 0, 'base']} px={[4, 4, 6]} py={[6, 6, 8]}>
                        <Container variant="form">
                            <Stack spacing={6}>
                                <Heading fontSize="lg">
                                    <FormattedMessage defaultMessage="Delivery Details" />
                                </Heading>

                                <SimpleGrid columns={[1, 1, 2]} spacing={6}>
                                    <Stack spacing={1}>
                                        <Heading as="h3" fontSize="sm">
                                            <FormattedMessage defaultMessage="Shipping Address" />
                                        </Heading>
                                        <AddressDisplay
                                            address={order.shipments[0].shippingAddress}
                                        />
                                    </Stack>

                                    <Stack spacing={1}>
                                        <Heading as="h3" fontSize="sm">
                                            <FormattedMessage defaultMessage="Shipping Method" />
                                        </Heading>
                                        <Box>
                                            <Text>{order.shipments[0].shippingMethod.name}</Text>
                                            <Text>
                                                {order.shipments[0].shippingMethod.description}
                                            </Text>
                                        </Box>
                                    </Stack>
                                </SimpleGrid>
                            </Stack>
                        </Container>
                    </Box>

                    <Box layerStyle="card" rounded={[0, 0, 'base']} px={[4, 4, 6]} py={[6, 6, 8]}>
                        <Container variant="form">
                            <Stack spacing={6}>
                                <Heading fontSize="lg">
                                    <FormattedMessage defaultMessage="Order Summary" />
                                </Heading>

                                <Stack spacing={4}>
                                    <Text>
                                        <FormattedMessage
                                            description="# item(s) in order"
                                            defaultMessage="{itemCount, plural, =0 {0 items} one {# item} other {# items}}"
                                            values={{
                                                itemCount: order.productItems.reduce(
                                                    (a, b) => a + b.quantity,
                                                    0
                                                )
                                            }}
                                        />
                                    </Text>

                                    <Stack spacing={5} align="flex-start">
                                        <Stack
                                            spacing={5}
                                            align="flex-start"
                                            width="full"
                                            divider={<Divider />}
                                        >
                                            {order.productItems?.map((product, idx) => {
                                                const variant = {
                                                    ...product,
                                                    ...(order._productItemsDetail &&
                                                        order._productItemsDetail[
                                                            product.productId
                                                        ]),
                                                    price: product.price
                                                }
                                                return (
                                                    <CartItemVariant
                                                        key={product.productId}
                                                        index={idx}
                                                        variant={variant}
                                                    >
                                                        <Flex width="full" alignItems="flex-start">
                                                            <CartItemVariantImage
                                                                width="80px"
                                                                mr={2}
                                                            />
                                                            <Stack
                                                                spacing={1}
                                                                marginTop="-3px"
                                                                flex={1}
                                                            >
                                                                <CartItemVariantName />
                                                                <Flex
                                                                    width="full"
                                                                    justifyContent="space-between"
                                                                    alignItems="flex-end"
                                                                >
                                                                    <CartItemVariantAttributes
                                                                        includeQuantity
                                                                    />
                                                                    <CartItemVariantPrice />
                                                                </Flex>
                                                            </Stack>
                                                        </Flex>
                                                    </CartItemVariant>
                                                )
                                            })}
                                        </Stack>

                                        <Stack w="full" py={4} borderY="1px" borderColor="gray.200">
                                            <Flex justify="space-between">
                                                <Text fontWeight="bold">
                                                    <FormattedMessage defaultMessage="Subtotal" />
                                                </Text>
                                                <Text fontWeight="bold">
                                                    <FormattedNumber
                                                        style="currency"
                                                        currency={order?.currency}
                                                        value={order?.productSubTotal}
                                                    />
                                                </Text>
                                            </Flex>
                                            {order.orderPriceAdjustments?.map((adjustment) => (
                                                <Flex
                                                    justify="space-between"
                                                    key={adjustment.priceAdjustmentId}
                                                >
                                                    <Text>{adjustment.itemText}</Text>
                                                    <Text color="green.500">
                                                        <FormattedNumber
                                                            style="currency"
                                                            currency={order?.currency}
                                                            value={adjustment.price}
                                                        />
                                                    </Text>
                                                </Flex>
                                            ))}
                                            <Flex justify="space-between">
                                                <Flex alignItems="center">
                                                    <Text lineHeight={1}>
                                                        <FormattedMessage defaultMessage="Shipping" />
                                                        {order.shippingItems[0].priceAdjustments
                                                            ?.length > 0 && (
                                                            <Text as="span" ml={1}>
                                                                (
                                                                <FormattedMessage defaultMessage="promo applied" />
                                                                )
                                                            </Text>
                                                        )}
                                                    </Text>
                                                    {order.shippingItems?.[0]?.priceAdjustments
                                                        ?.length > 0 && (
                                                        <PromoPopover ml={2}>
                                                            <Stack>
                                                                {order.shippingItems[0].priceAdjustments?.map(
                                                                    (adjustment) => (
                                                                        <Text
                                                                            key={
                                                                                adjustment.priceAdjustmentId
                                                                            }
                                                                            fontSize="sm"
                                                                        >
                                                                            {adjustment.itemText}
                                                                        </Text>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </PromoPopover>
                                                    )}
                                                </Flex>

                                                {order.shippingItems[0].priceAdjustments?.some(
                                                    ({appliedDiscount}) =>
                                                        appliedDiscount?.type === 'free'
                                                ) ? (
                                                    <Text
                                                        as="span"
                                                        color="green.500"
                                                        textTransform="uppercase"
                                                    >
                                                        <FormattedMessage defaultMessage="Free" />
                                                    </Text>
                                                ) : (
                                                    <Text>
                                                        <FormattedNumber
                                                            value={order.shippingTotal}
                                                            style="currency"
                                                            currency={order.currency}
                                                        />
                                                    </Text>
                                                )}
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>
                                                    <FormattedMessage defaultMessage="Tax" />
                                                </Text>
                                                <Text>
                                                    <FormattedNumber
                                                        value={order.taxTotal}
                                                        style="currency"
                                                        currency={order.currency}
                                                    />
                                                </Text>
                                            </Flex>
                                        </Stack>

                                        <Flex w="full" justify="space-between">
                                            <Text fontWeight="bold">
                                                <FormattedMessage defaultMessage="Order Total" />
                                            </Text>
                                            <Text fontWeight="bold">
                                                <FormattedNumber
                                                    style="currency"
                                                    currency={order?.currency}
                                                    value={order?.orderTotal}
                                                />
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Container>
                    </Box>

                    <Box layerStyle="card" rounded={[0, 0, 'base']} px={[4, 4, 6]} py={[6, 6, 8]}>
                        <Container variant="form">
                            <Stack spacing={6}>
                                <Heading fontSize="lg">
                                    <FormattedMessage defaultMessage="Payment Details" />
                                </Heading>

                                <SimpleGrid columns={[1, 1, 2]} spacing={6}>
                                    <Stack spacing={1}>
                                        <Heading as="h3" fontSize="sm">
                                            <FormattedMessage defaultMessage="Billing Address" />
                                        </Heading>
                                        <AddressDisplay address={order.billingAddress} />
                                    </Stack>

                                    <Stack spacing={1}>
                                        <Heading as="h3" fontSize="sm">
                                            <FormattedMessage defaultMessage="Credit Card" />
                                        </Heading>

                                        <Stack direction="row">
                                            {CardIcon && <CardIcon layerStyle="ccIcon" />}

                                            <Box>
                                                <Text>
                                                    {
                                                        order.paymentInstruments[0].paymentCard
                                                            ?.cardType
                                                    }
                                                </Text>
                                                <Stack direction="row">
                                                    <Text>
                                                        &bull;&bull;&bull;&bull;{' '}
                                                        {
                                                            order.paymentInstruments[0].paymentCard
                                                                ?.numberLastDigits
                                                        }
                                                    </Text>
                                                    <Text>
                                                        {
                                                            order.paymentInstruments[0].paymentCard
                                                                ?.expirationMonth
                                                        }
                                                        /
                                                        {
                                                            order.paymentInstruments[0].paymentCard
                                                                ?.expirationYear
                                                        }
                                                    </Text>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </SimpleGrid>
                            </Stack>
                        </Container>
                    </Box>
                </Stack>
            </Container>
        </Box>
    )
}

export default CheckoutConfirmation
