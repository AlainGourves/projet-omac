import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';

const FormMagic = function (props) {


    const schema = yup.object().shape({
        email: yup.string().email("Vérifier l'adresse mail, elle ne semble pas correcte.").required("Merci de renseigner votre adresse mail."),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            'email': '',
        },
        resolver: yupResolver(schema),
    });

    const onSubmit = async (values) => {
        props.sendMagicLink(values.email);
    }

    return (
        <>
            {/* ------- FORMULAIRE CONNECTION -------------- */}
            <div className='login__card login__card-bg mb-4'>
            <p className='login__card-title'>Saisissez votre adresse mail pour créer un compte</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="col mb-3">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            {...register("email")}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type="email"
                        />
                        {errors.email &&
                            <AlertMesg message={errors.email?.message} />
                        }
                    </div>

                    <div className="login__submit">
                        <button className="btn btn-primary" type="submit">Continuer</button>
                    </div>

                </form>
            </div>

            <div className='login__card'>
                Vous avez déjà un mot de passe&nbsp;? <button
                    className='faux-link'
                    onClick={props.changePasswordState}>Connectez-vous</button>.
            </div>
        </>
    )
}

export default FormMagic;