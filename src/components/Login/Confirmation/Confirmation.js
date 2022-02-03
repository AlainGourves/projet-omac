import { Inbox, Clock } from 'react-feather';

const Confirmation = function ({ email, tooManyRequests }) {

    return (
        <div className='login__card login__card-bg login__card-confirm'>
            <div className='my-3 text-primary'>
                <figure>{tooManyRequests ? <Clock /> : <Inbox />}</figure>
                <p className='login__card-title'>
                    {tooManyRequests ? 'Veuillez réessayer dans quelques minutes' : 'Vérifiez vos mails'}
                </p>
            </div>
            {!tooManyRequests &&
                <>
                    <div className='mb-5'>Cliquez sur le lien de connexion envoyé à
                        <span className='d-block my-1'><strong>{email}</strong></span>
                        pour terminer la création du compte
                    </div>
                    <div className='mb-3 nota'>
                        <strong>NB</strong> : Si vous ne retrouvez pas le mail dans votre boîte de réception, pensez à regarder dans les spams.
                    </div>
                </>
            }
        </div>
    )
}

export default Confirmation;