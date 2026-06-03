export default function DashboardCard({

    title,

    value

}) {

    return (

        <div className="col-md-3">

            <div className="card border-0 shadow-sm">

                <div className="card-body">

                    <h6 className="text-muted">
                        {title}
                    </h6>

                    <h3>
                        {value}
                    </h3>

                </div>

            </div>

        </div>
    );
}