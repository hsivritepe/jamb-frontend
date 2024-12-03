import {
    BoxGrid,
    BoxGridRow,
    Box,
    BoxTitle,
    BoxDescription,
    BoxPrice,
    BoxTags,
} from '@/components/ui/BoxGrid';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';

export default function ServicePackages() {
    return (
        <section className="py-16">
            <SectionBoxTitle>
                Tailored Service Packages for Every Home Solution
            </SectionBoxTitle>

            <BoxGrid>
                <BoxGridRow>
                    <Box variant="default">
                        <div>
                            <BoxTitle>Basic package</BoxTitle>
                            <BoxDescription>
                                Perfect for homeowners looking for a
                                comprehensive yet cost-effective
                                solution to maintain their home and
                                garden.
                            </BoxDescription>
                            <BoxTags
                                tags={[
                                    'Fixing',
                                    'Painting',
                                    'Cleaning',
                                ]}
                            />
                        </div>
                        <a
                            href="#"
                            className="text-blue-600 text-xl font-medium"
                        >
                            <BoxPrice
                                amount={80}
                                period="month"
                                variant="default"
                            />
                            Read more
                        </a>
                    </Box>

                    <Box variant="light">
                        <div>
                            <BoxTitle>Enhanced package</BoxTitle>
                            <BoxDescription>
                                Designed for homeowners seeking a more
                                extensive range of home and garden
                                maintenance services.
                            </BoxDescription>
                            <BoxTags
                                tags={[
                                    'Fixing',
                                    'Painting',
                                    'Plumbing',
                                    'Electrical',
                                ]}
                                variant="light"
                            />
                        </div>
                        <a
                            href="#"
                            className="text-blue-600 text-xl font-medium"
                        >
                            <BoxPrice
                                amount={140}
                                period="month"
                                variant="light"
                            />
                            Read more
                        </a>
                    </Box>

                    <Box variant="primary" isPopular>
                        <div>
                            <BoxTitle>All-inclusive package</BoxTitle>
                            <BoxDescription>
                                The most comprehensive offering,
                                tailored for homeowners who demand the
                                highest level of care and attention
                                for their property.
                            </BoxDescription>
                            <BoxTags
                                variant="primary"
                                tags={[
                                    'Fixing',
                                    'Painting',
                                    'Plumbing',
                                    'Electrical',
                                    'Moving',
                                ]}
                            />
                        </div>
                        <a
                            href="#"
                            className="text-white text-xl font-medium"
                        >
                            <BoxPrice
                                amount={200}
                                period="month"
                                variant="primary"
                            />
                            Read more
                        </a>
                    </Box>
                </BoxGridRow>

                <Box variant="full-width">
                    <div className="flex justify-between items-start">
                        <div>
                            <BoxTitle>
                                Configure your own package
                            </BoxTitle>
                            <BoxDescription>
                                Put together a package of the services
                                you need.
                            </BoxDescription>
                        </div>
                        <div className="text-right w-1/3">
                            <BoxPrice amount={140} period="month" />
                            <a
                                href="#"
                                className="text-blue-500 text-xl font-medium"
                            >
                                Read more
                            </a>
                        </div>
                    </div>
                </Box>
            </BoxGrid>
        </section>
    );
}
