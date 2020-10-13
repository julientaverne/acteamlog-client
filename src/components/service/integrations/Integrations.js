import React, { useEffect, useState } from 'react';
import { FiCode, FiSlack } from 'react-icons/fi';
import { FaDiscord, FaEnvelope } from 'react-icons/fa';

import InputField from 'components/UI/inputField/InputField';
import Card, { Header, Title } from 'components/UI/card/Card';
import Button from 'components/UI/button/Button';

import fetchClient from 'fetchClient';
import { useStore } from 'context';

import styling from './Integrations.module.scss';

const Integrations = (props) => {
    const [store, dispatch, setError] = useStore();
    
    const [{ prevWebhookURL, webhookURL, slackURL, prevSlackURL, discordURL, prevDiscordURL, loading }, setState] = useState({
        webhookURL: '',
        prevWebhookURL: '',
        slackURL: '',
        prevSlackURL: '',
        discordURL: '',
        prevDiscordURL: '',
        loading: false
    });
    
    
    /**
     * Sets or updates the Slack webhook URL for the service
     * with the given ID.
     * @returns {Promise<void>}
     */
    const updateService = async () => {
        try {
            setState(prevState => ({ ...prevState, loading: true }));
            
            const update = { slackWebhookURL: slackURL, discordWebhookURL: discordURL, webhookURL };
            
            await fetchClient('updateService', update, '/service/' + props.serviceId);
            
            const tmpServices = [...store.services];
            const index = tmpServices.findIndex(x => x.id === props.serviceId);
            
            tmpServices[index].slackWebhookURL = slackURL;
            tmpServices[index].discordURL = discordURL;
            tmpServices[index].webhookURL = webhookURL;
            
            dispatch({ action: 'update', payload: { services: tmpServices } });
            
            setState(prevState => ({
                ...prevState,
                loading: false,
                prevSlackURL: slackURL,
                prevDiscordURL: discordURL,
                prevWebhookURL: webhookURL
            }));
            
        } catch (error) {
            console.error(error);
            setState(prevState => ({ ...prevState, loading: false }));
            setError(error);
        }
    };
    
    
    /**
     * Validates the input fields.
     * @returns {boolean} if the input fields are valid
     */
    const validateInput = () => {
        if (slackURL && slackURL.length < 70) {
            return false;
        }
        
        if (slackURL && !slackURL.includes('https://hooks.slack.com/services/')) {
            return false;
        }
        
        if (slackURL === prevSlackURL && webhookURL === prevWebhookURL && discordURL === prevDiscordURL) {
            return false;
        }
        
        return !loading;
    };
    
    
    /**
     * Save the props in state.
     */
    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            prevSlackURL: props.slackWebhookURL || '',
            slackURL: props.slackWebhookURL || '',
            prevDiscordURL: props.discordWebhookURL || '',
            discordURL: props.discordWebhookURL || '',
            prevWebhookURL: props.webhookURL || '',
            webhookURL: props.webhookURL || ''
        }));
    }, [props.discordWebhookURL, props.slackWebhookURL, props.webhookURL]);
    
    
    return (
        <Card>
            <Header icon={<FiCode />}>Integrations</Header>
            
            <Title icon={<FaEnvelope />}>Email</Title>
            
            <p className={styling.caption}>
                If provided, all error events will be sent to this email.
            </p>
            
            <InputField
                value={webhookURL}
                onChange={({ target }) => setState(prevState => ({ ...prevState, webhookURL: target.value }))}
                placeholder='Email'
            />
            
            <Title icon={<FaDiscord />}>Discord</Title>
            
            <p className={styling.caption}>
                Create a webhook in Discord for the desired server and channel and add the webhook URL below. For
                further help, please refer to the <a
                href='https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks' target='_blank'
                rel='noopener noreferrer'>Discord Documentation</a>. Make sure to add <b>"/slack"</b> at the end of the
                webhook URL.
            </p>
            
            <InputField
                value={discordURL}
                onChange={({ target }) => setState(prevState => ({ ...prevState, discordURL: target.value }))}
                placeholder='Discord Webhook URL'
                test={/https:\/\/discord.com\/api\/webhooks\//}
            />
            
            <Title icon={<FiSlack />}>Slack</Title>
            
            <p className={styling.caption}>
                Create a webhook in Slack and add it to the desired Slack channel.
                To receive Slack alerts, paste the webhook URL below.
                You will then be notified every time an error occurred.
                Refer to the <a href='https://api.slack.com/messaging/webhooks' target='_blank' rel='noopener noreferrer'>
                Slack Documentation</a> for help.
            </p>
            
            <InputField
                value={slackURL}
                onChange={({ target }) => setState(prevState => ({ ...prevState, slackURL: target.value }))}
                placeholder='Slack Webhook URL'
                test={/https:\/\/hooks.slack.com\/services\//}
            />
            
            <div className={styling.controls}>
                <Button onClick={updateService} disabled={!validateInput()}>Save</Button>
            </div>
        </Card>
    );
};

export default Integrations;