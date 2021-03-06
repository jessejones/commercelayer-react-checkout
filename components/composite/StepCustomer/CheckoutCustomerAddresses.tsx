import {
  AddressesContainer,
  BillingAddressForm,
  SaveAddressesButton,
  ShippingAddressForm,
  BillingAddressContainer,
  ShippingAddressContainer,
} from "@commercelayer/react-components"
import { Address } from "@commercelayer/sdk"
import { Transition } from "@headlessui/react"
import { useState, Fragment, useEffect } from "react"
import { useTranslation } from "react-i18next"
import styled from "styled-components"

import "twin.macro"
import { AddButton } from "components/ui/AddButton"
import { ButtonCss, ButtonWrapper } from "components/ui/Button"
import { CustomerAddressCard } from "components/ui/CustomerAddressCard"
import { GridContainer } from "components/ui/GridContainer"
import { SpinnerIcon } from "components/ui/SpinnerIcon"
import { Toggle } from "components/ui/Toggle"

import { AddressFormBottom } from "./AddressFormBottom"
import { AddressSectionEmail } from "./AddressSectionEmail"
import { AddressSectionSaveForm } from "./AddressSectionSaveForm"
import { AddressSectionTitle } from "./AddressSectionTitle"
import { BillingAddressFormNew } from "./BillingAddressFormNew"
import { ShippingAddressFormNew } from "./ShippingAddressFormNew"

interface Props {
  billingAddress: Address | undefined
  shippingAddress: Address | undefined
  hasSameAddresses: boolean
  isShipmentRequired: boolean
  isUsingNewBillingAddress: boolean
  isUsingNewShippingAddress: boolean
  hasCustomerAddresses: boolean
  emailAddress: string | undefined
  isLocalLoader: boolean
  handleSave: () => void
}

type AddressTypeEnum = "shipping" | "billing"

export const CheckoutCustomerAddresses: React.FC<Props> = ({
  billingAddress,
  shippingAddress,
  isUsingNewBillingAddress,
  isUsingNewShippingAddress,
  isShipmentRequired,
  hasSameAddresses,
  hasCustomerAddresses,
  emailAddress,
  isLocalLoader,
  handleSave,
}: Props) => {
  const { t } = useTranslation()

  const [billingAddressFill, setBillingAddressFill] = useState<
    Address | undefined
  >(billingAddress)
  const [shippingAddressFill, setShippingAddressFill] = useState<
    Address | undefined
  >(shippingAddress)

  const [shipToDifferentAddress, setShipToDifferentAddress] = useState<boolean>(
    !hasSameAddresses
  )

  const [showBillingAddressForm, setShowBillingAddressForm] = useState<boolean>(
    isUsingNewBillingAddress
  )

  const [mountBillingAddressForm, setMountBillingAddressForm] =
    useState<boolean>(isUsingNewBillingAddress)

  const [showShippingAddressForm, setShowShippingAddressForm] =
    useState<boolean>(isUsingNewShippingAddress)

  const [mountShippingAddressForm, setMountShippingAddressForm] =
    useState<boolean>(isUsingNewShippingAddress)

  useEffect(() => {
    if (shipToDifferentAddress && !hasCustomerAddresses) {
      setShippingAddressFill(undefined)
      setShowShippingAddressForm(true)
      setMountShippingAddressForm(true)
    }
  }, [shipToDifferentAddress])

  useEffect(() => {
    // temp fix to resolve flag bug
    if (showBillingAddressForm) {
      localStorage.setItem(
        "_save_billing_address_to_customer_address_book",
        "false"
      )
    }
    if (showShippingAddressForm) {
      localStorage.setItem(
        "_save_shipping_address_to_customer_address_book",
        "false"
      )
    }
    // --
  }, [showBillingAddressForm, showShippingAddressForm])

  const handleScroll = (type: AddressTypeEnum) => {
    const tab = document
      .querySelector(`h3[data-cy="${type}-address"]`)
      ?.getBoundingClientRect()
    const top = window.scrollY + (tab?.top as number)
    const left = window.scrollX + (tab?.left as number)
    window.scrollTo({ left, top: top, behavior: "smooth" })
  }

  const handleShowBillingForm = () => {
    setBillingAddressFill(undefined)
    setShowBillingAddressForm(!showBillingAddressForm)
    handleScroll("billing")
  }

  const handleShowShippingForm = () => {
    setShippingAddressFill(undefined)
    setShowShippingAddressForm(!showShippingAddressForm)
    handleScroll("shipping")
  }

  const handleToggle = () => {
    if (!hasCustomerAddresses) {
      handleShowShippingForm()
    }
    if (hasCustomerAddresses) {
      setMountShippingAddressForm(false)
      setShowShippingAddressForm(false)
    }
    setShipToDifferentAddress(!shipToDifferentAddress)
  }

  return (
    <Fragment>
      <AddressSectionEmail readonly emailAddress={emailAddress as string} />
      <AddressesContainer shipToDifferentAddress={shipToDifferentAddress}>
        <AddressSectionTitle data-cy="billing-address">
          {t(`addressForm.billing_address_title`)}
        </AddressSectionTitle>
        <div className="relative overflow-hidden">
          <>
            {hasCustomerAddresses && (
              <>
                <Transition
                  show={!showBillingAddressForm}
                  {...addressesTransition}
                >
                  <GridContainer className="mb-4">
                    <BillingAddressContainer>
                      <CustomerAddressCard
                        addressType="billing"
                        deselect={showBillingAddressForm}
                        onSelect={() =>
                          localStorage.setItem(
                            "_save_billing_address_to_customer_address_book",
                            "false"
                          )
                        }
                      />
                    </BillingAddressContainer>
                  </GridContainer>
                </Transition>

                {!showBillingAddressForm && hasCustomerAddresses && (
                  <AddButton
                    dataCy="add_new_billing_address"
                    action={handleShowBillingForm}
                  />
                )}
              </>
            )}
          </>
          <div className="top-0 mt-4">
            <Transition
              show={showBillingAddressForm}
              beforeEnter={() => setMountBillingAddressForm(true)}
              afterLeave={() => setMountBillingAddressForm(false)}
              {...formTransition}
            >
              <BillingAddressForm
                autoComplete="on"
                reset={!showBillingAddressForm}
                errorClassName="hasError"
              >
                {mountBillingAddressForm || !hasCustomerAddresses ? (
                  <>
                    <BillingAddressFormNew
                      billingAddress={billingAddressFill}
                    />
                    <AddressFormBottom
                      addressType="billing"
                      onClick={handleShowBillingForm}
                      hasCustomerAddresses={hasCustomerAddresses}
                    />
                  </>
                ) : (
                  <Fragment />
                )}
              </BillingAddressForm>
            </Transition>
          </div>
        </div>
        {isShipmentRequired && (
          <>
            <Toggle
              data-cy="button-ship-to-different-address"
              data-status={shipToDifferentAddress}
              label={t(`addressForm.ship_to_different_address`)}
              checked={shipToDifferentAddress}
              onChange={handleToggle}
            />
            <div className={`${shipToDifferentAddress ? "" : "hidden"} mb-2`}>
              <AddressSectionTitle data-cy="shipping-address">
                {t(`addressForm.shipping_address_title`)}
              </AddressSectionTitle>
            </div>
            <div
              className={`${
                shipToDifferentAddress && hasCustomerAddresses
                  ? "mb-4"
                  : "hidden"
              }`}
            >
              <Transition
                show={!showShippingAddressForm}
                {...addressesTransition}
              >
                <GridContainer className="mb-4">
                  <ShippingAddressContainer>
                    <CustomerAddressCard
                      addressType="shipping"
                      deselect={showShippingAddressForm}
                      onSelect={() =>
                        localStorage.setItem(
                          "_save_shipping_address_to_customer_address_book",
                          "false"
                        )
                      }
                    />
                  </ShippingAddressContainer>
                </GridContainer>
              </Transition>

              {!showShippingAddressForm && (
                <AddButton
                  dataCy="add_new_shipping_address"
                  action={handleShowShippingForm}
                />
              )}
            </div>
            <div className="mt-4">
              <Transition
                show={showShippingAddressForm}
                beforeEnter={() => setMountShippingAddressForm(true)}
                beforeLeave={() => setMountShippingAddressForm(false)}
                {...formTransition}
              >
                <ShippingAddressForm
                  autoComplete="on"
                  hidden={!shipToDifferentAddress}
                  reset={!mountShippingAddressForm}
                  errorClassName="hasError"
                  className="pt-2"
                >
                  {mountShippingAddressForm ? (
                    <>
                      <ShippingAddressFormNew
                        shippingAddress={shippingAddressFill}
                      />
                      <AddressFormBottom
                        className="mb-4"
                        addressType="shipping"
                        onClick={handleShowShippingForm}
                        hasCustomerAddresses={hasCustomerAddresses}
                      />
                    </>
                  ) : (
                    <Fragment />
                  )}
                </ShippingAddressForm>
              </Transition>
            </div>
          </>
        )}
        <AddressSectionSaveForm>
          <ButtonWrapper>
            <StyledSaveAddressesButton
              disabled={isLocalLoader}
              label={
                <>
                  {isLocalLoader && <SpinnerIcon />}
                  {isShipmentRequired
                    ? t("stepCustomer.continueToDelivery")
                    : t("stepShipping.continueToPayment")}
                </>
              }
              data-cy="save-addresses-button"
              onClick={handleSave}
            />
          </ButtonWrapper>
        </AddressSectionSaveForm>
      </AddressesContainer>
    </Fragment>
  )
}

const addressesTransition = {
  enter: "transform transition duration-400",
  enterFrom: "opacity-0  -translate-y-full",
  enterTo: "opacity-100 translate-y-0",
  leave: "transform duration-400 transition ease-out absolute top-0 w-full",
  leaveFrom: "opacity-100 translate-y-0 ",
  leaveTo: "opacity-0 -translate-y-full",
}

const formTransition = {
  enter: "transform transition duration-400",
  enterFrom: "opacity-0 translate-y-full",
  enterTo: "opacity-100 translate-y-0",
  leave:
    "transform duration-400 transition ease-out absolute top-0 w-full min-h-full",
  leaveFrom: "opacity-100 translate-y-0",
  leaveTo: "opacity-0 translate-y-full",
}

const StyledSaveAddressesButton = styled(SaveAddressesButton)`
  ${ButtonCss}
`
